import OpenAI from 'openai';
import { getSystemPrompts } from './prompts';

export class WebsiteAnalyzer {
  constructor(language = 'en') {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.language = language;
  }

  formatUrl(url) {
    if (!url?.trim()) return '';
    
    // Keep original URL structure (www or non-www)
    let formattedUrl = url.trim();
    
    // Add protocol if missing
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    return formattedUrl;
  }

  generateUrlVariants(url) {
    const urlObj = new URL(url);
    const variants = [url]; // Original URL is first priority
    
    // Add www variant if not present
    if (!urlObj.hostname.startsWith('www.')) {
      const wwwUrl = new URL(url);
      wwwUrl.hostname = 'www.' + urlObj.hostname;
      variants.push(wwwUrl.toString());
    }
    
    // Add non-www variant if www is present
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
    const timeout = 10000; // 10 second timeout

    // Try each URL variant with each proxy
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

          if (!response.ok) {
            continue; // Try next proxy or URL variant
          }

          const html = await response.text();
        
          if (!html || html.trim().length === 0) {
            continue; // Try next proxy or URL variant
          }

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Remove unwanted elements and common ad/tracking elements
          ['script', 'style', 'iframe', 'noscript', 'link', 'meta', 'footer', 'header', 
           'nav', 'aside', '[class*="cookie"]', '[class*="popup"]', '[class*="modal"]',
           '[class*="banner"]', '[class*="ad-"]', '[class*="advertisement"]',
           '[id*="cookie"]', '[id*="popup"]', '[id*="modal"]', '[id*="banner"]',
           '[id*="ad-"]', '[id*="advertisement"]'].forEach(tag => {
            doc.querySelectorAll(tag).forEach(el => el.remove());
          });

          let content = '';

          // Prioritized content areas
          const mainSelectors = [
            // About section selectors
            '[class*="about"]:not(footer *)', '[id*="about"]:not(footer *)',
            // Company info selectors
            '[class*="company"]:not(footer *)', '[id*="company"]:not(footer *)',
            // Main content selectors
            'main:not(footer main)', 'article:not(footer article)',
            '[role="main"]:not(footer [role="main"])',
            // Hero/Header content
            '.hero:not(footer *)', '#hero:not(footer *)',
            // Important text sections
            'h1:not(footer h1)', '.headline:not(footer *)',
            // Description sections
            '[class*="description"]:not(footer *)', '[id*="description"]:not(footer *)',
            // Mission/Values sections
            '[class*="mission"]:not(footer *)', '[id*="mission"]:not(footer *)',
            '[class*="values"]:not(footer *)', '[id*="values"]:not(footer *)'];

          // Get meta information with priority
          const metaDesc = doc.querySelector('meta[name="description"]');
          if (metaDesc) {
            const desc = metaDesc.getAttribute('content');
            if (desc && desc.length > 50) { // Only include substantial descriptions
              content += desc + '\n\n';
            }
          }

          // Process content by priority
          const processedTexts = new Set(); // To avoid duplicates
          for (const selector of mainSelectors) {
            const elements = doc.querySelectorAll(selector);
            for (const element of elements) {
              // Skip if element is hidden
              const style = window.getComputedStyle(element);
              if (style.display === 'none' || style.visibility === 'hidden') {
                continue;
              }

              let text = element.textContent
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n');

              // Only include substantial content
              if (text.length > 20 && !processedTexts.has(text)) {
                processedTexts.add(text);
                content += text + '\n\n';
              }
            }
          }

          // If still no content, try getting body text
          if (!content.trim() && doc.body) {
            content = doc.body.textContent
              .trim()
              .replace(/\s+/g, ' ')
              .replace(/\n+/g, '\n');
          }

          // Final content cleanup
          content = content
            .trim()
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .replace(/\n +/g, '\n');

          if (content.length > 0) {
            return content;
          }

          continue; // Try next proxy or URL variant
        } catch (error) {
          lastError = error;
          continue; // Try next proxy or URL variant
        }
      }
    }

    // Only throw error if all attempts failed
    throw new Error('Failed to access website content');
  }

  async analyzeContent(content) {
    if (!content || content.trim().length === 0) {
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
        
        // Clean up company name - extract just the name before any period or descriptive text
        const cleanedName = result.companyName
          .split(/[.:]|\s+-\s+/)[0]  // Split on period, colon, or dash
          .replace(/^(la |el |las |los |l'|le |les |the |a |an )/i, '') // Remove articles
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
        
        result = {
          companyName: cleanedName,
          activity: activityParts.join(' ').replace(/^:\s*/, '')
        };
        return result;
      }
    } catch (error) {
      console.error('Error in content analysis:', error);
      throw new Error('Failed to analyze website content. Please try again or enter details manually.');
    }
  }
}