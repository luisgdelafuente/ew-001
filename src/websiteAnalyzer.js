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
    if (!url) return '';
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    return url;
  }

  async extractMainContent(url) {
    if (!url) {
      throw new Error('Please provide a valid URL');
    }

    const formattedUrl = this.formatUrl(url);
    const corsProxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/'
    ];

    let lastError = null;

    for (const proxy of corsProxies) {
      try {
        const response = await fetch(proxy + encodeURIComponent(formattedUrl), {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();
        
        if (!html || html.trim().length === 0) {
          throw new Error('Empty response received');
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove unwanted elements
        ['script', 'style', 'iframe', 'noscript', 'link', 'meta'].forEach(tag => {
          doc.querySelectorAll(tag).forEach(el => el.remove());
        });

        let content = '';

        // Get meta information
        const metaDesc = doc.querySelector('meta[name="description"]');
        if (metaDesc) {
          content += metaDesc.getAttribute('content') + '\n\n';
        }

        // Get title
        const title = doc.querySelector('title');
        if (title) {
          content += 'Page Title: ' + title.textContent.trim() + '\n\n';
        }

        // Get main content areas
        const mainSelectors = [
          'main',
          'article',
          '[role="main"]',
          'h1',
          'h2',
          '.about',
          '#about',
          'section',
          '.company-info',
          '#company-info',
          '.hero',
          '.header-content',
          '[class*="about"]',
          '[class*="company"]',
          '[class*="description"]'
        ];

        const contentElements = mainSelectors.flatMap(selector => 
          Array.from(doc.querySelectorAll(selector))
        );

        // Extract text from elements
        const processedTexts = new Set(); // To avoid duplicates
        contentElements.forEach(element => {
          const text = element.textContent
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n');
          
          if (text && !processedTexts.has(text)) {
            processedTexts.add(text);
            content += text + '\n\n';
          }
        });

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

        throw new Error('No content could be extracted');
      } catch (error) {
        lastError = error;
        console.warn(`Failed to fetch with proxy ${proxy}:`, error.message);
        continue;
      }
    }

    throw new Error(`Could not access the website: ${lastError?.message || 'Unknown error'}`);
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