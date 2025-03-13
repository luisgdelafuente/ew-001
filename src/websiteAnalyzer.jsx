import OpenAI from 'openai';
import { getSystemPrompts } from './prompts';
import { config } from './config';

export class WebsiteAnalyzer {
  constructor(language = 'en') {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      dangerouslyAllowBrowser: true
    });
    this.language = language;
  }

  formatUrl(url) {
    if (!url?.trim()) return '';
    
    let formattedUrl = url.trim();
    
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    return formattedUrl;
  }

  generateUrlVariants(url) {
    const urlObj = new URL(url);
    const variants = [url];
    
    if (!urlObj.hostname.startsWith('www.')) {
      const wwwUrl = new URL(url);
      wwwUrl.hostname = 'www.' + urlObj.hostname;
      variants.push(wwwUrl.toString());
    }
    
    if (urlObj.hostname.startsWith('www.')) {
      const nonWwwUrl = new URL(url);
      nonWwwUrl.hostname = urlObj.hostname.replace(/^www\./, '');
      variants.push(nonWwwUrl.toString());
    }
    
    return variants;
  }

  async extractMainContent(url) {
    if (!url) {
      throw new Error('Please provide a valid URL');
    }

    const formattedUrl = this.formatUrl(url);
    const urlVariants = this.generateUrlVariants(formattedUrl);
    const corsProxies = [
      'https://proxy.cors.sh/',
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];

    let lastError = null;
    const timeout = 10000;

    for (const urlVariant of urlVariants) {
      for (const proxy of corsProxies) {
        try {
          const response = await fetch(proxy + encodeURIComponent(urlVariant), {
            signal: AbortSignal.timeout(timeout),
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });

          if (!response.ok) continue;

          const html = await response.text();
          if (!html?.trim()) continue;

          // Create a temporary div to parse HTML
          const div = document.createElement('div');
          div.innerHTML = html;

          // Remove unwanted elements
          const unwantedSelectors = [
            'script', 'style', 'iframe', 'noscript', 'link', 'meta', 'footer', 'header',
            'nav', 'aside', '[class*="cookie"]', '[class*="popup"]', '[class*="modal"]',
            '[class*="banner"]', '[class*="ad-"]', '[class*="advertisement"]',
            '[id*="cookie"]', '[id*="popup"]', '[id*="modal"]', '[id*="banner"]',
            '[id*="ad-"]', '[id*="advertisement"]'
          ];

          unwantedSelectors.forEach(selector => {
            div.querySelectorAll(selector).forEach(el => el.remove());
          });

          let content = '';

          // Get meta description
          const metaDesc = div.querySelector('meta[name="description"]');
          if (metaDesc?.getAttribute('content')?.length > 50) {
            content += metaDesc.getAttribute('content') + '\n\n';
          }

          // Prioritized content areas
          const mainSelectors = [
            '[class*="about"]:not(footer *)', '[id*="about"]:not(footer *)',
            '[class*="company"]:not(footer *)', '[id*="company"]:not(footer *)',
            'main:not(footer main)', 'article:not(footer article)',
            '[role="main"]:not(footer [role="main"])',
            '.hero:not(footer *)', '#hero:not(footer *)',
            'h1:not(footer h1)', '.headline:not(footer *)',
            '[class*="description"]:not(footer *)', '[id*="description"]:not(footer *)',
            '[class*="mission"]:not(footer *)', '[id*="mission"]:not(footer *)',
            '[class*="values"]:not(footer *)', '[id*="values"]:not(footer *)'
          ];

          const processedTexts = new Set();
          
          mainSelectors.forEach(selector => {
            div.querySelectorAll(selector).forEach(element => {
              const text = element.textContent
                ?.trim()
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n');

              if (text?.length > 20 && !processedTexts.has(text)) {
                processedTexts.add(text);
                content += text + '\n\n';
              }
            });
          });

          if (!content.trim() && div.textContent) {
            content = div.textContent
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/\n+/g, '\n');
          }

          content = content
            .trim()
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .replace(/\n +/g, '\n');

          if (content.length > 0) return content;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
    }

    throw new Error('Failed to access website content');
  }

  async analyzeContent(content) {
    if (!content?.trim()) {
      throw new Error('No content provided for analysis');
    }

    try {
      const prompts = getSystemPrompts(this.language);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: `Extract company information from the provided content and provide the description in ${this.language} language. Return a JSON object with:
{
  "companyName": "Just the company name, no additional text",
  "activity": "3-4 sentences describing what they do in ${this.language} language"
}`
        }, {
          role: "user",
          content: `Extract from this content and provide the description in ${this.language} language:
1. Company name (just the name, no extra text)
2. Brief company description in ${this.language} (3-4 sentences)

Website content:
${content.substring(0, 2000)}`
        }],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" },
        presence_penalty: 0,
        frequency_penalty: 0
      });

      let result;
      try {
        result = JSON.parse(response.choices[0].message.content);
        
        const cleanedName = result.companyName
          .split(/[.:]|\s+-\s+/)[0]
          .replace(/^(la |el |las |los |l'|le |les |the |a |an )/i, '')
          .trim();
        
        return {
          companyName: cleanedName,
          activity: result.activity.trim()
        };
      } catch (error) {
        const lines = response.choices[0].message.content.split('\n');
        const cleanedLines = lines.map(line => 
          line.replace(/^[^a-zA-Z]*|company name:?\s*:?\s*|brief company description:?\s*:?\s*|description:?\s*:?\s*|\*\*/gi, '')
            .trim()
        ).filter(line => line);
        
        const [companyName = '', ...activityParts] = cleanedLines;
        const cleanedName = companyName
          .split(/[.:]|\s+-\s+/)[0]
          .replace(/^(la |el |las |los |l'|le |les |the |a |an )/i, '')
          .trim();
        
        return {
          companyName: cleanedName,
          activity: activityParts.join(' ').replace(/^:\s*/, '')
        };
      }
    } catch (error) {
      console.error('Error in content analysis:', error);
      throw new Error('Failed to analyze website content. Please try again or enter details manually.');
    }
  }
}