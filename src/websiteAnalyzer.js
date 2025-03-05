import OpenAI from 'openai';
import { getSystemPrompts } from './prompts';

export class WebsiteAnalyzer {
  constructor(apiKey, language = 'en') {
    this.openai = new OpenAI({
      apiKey: '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',
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
        model: "gpt-4", // Using GPT-4 for better analysis
        messages: [{
          role: "system",
          content: prompts.websiteAnalysis
        }, {
          role: "user",
          content: `Analyze this website content and extract:
1. The company name (if found)
2. A detailed description (4-6 sentences) of the company's main activity, target audience, value proposition, and what makes them unique in their industry.

Format the response as:
{
  "companyName": "Found company name or empty string if not found",
  "activity": "Detailed company activity description that covers their business model, services/products, target audience, and unique selling points"
}

Website content to analyze:
${content.substring(0, 4000)}`
        }],
        temperature: 0.3,
        max_tokens: 500, // Increased token limit for more detailed responses
        presence_penalty: 0,
        frequency_penalty: 0
      });

      let result;
      try {
        result = JSON.parse(response.choices[0].message.content);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', error);
        // Try to extract information from non-JSON response
        const text = response.choices[0].message.content;
        const companyMatch = text.match(/company.*?name.*?:?\s*"?([^"\n]+)"?/i);
        const activityMatch = text.match(/activity.*?:?\s*"?([^"\n]+)"?/i);
        
        result = {
          companyName: companyMatch ? companyMatch[1].trim() : '',
          activity: activityMatch ? activityMatch[1].trim() : text.substring(0, 400) // Increased length for more detailed description
        };
      }

      // Validate and clean the result
      return {
        companyName: (result.companyName || '').trim(),
        activity: (result.activity || '').trim()
      };
    } catch (error) {
      console.error('Error in content analysis:', error);
      throw new Error('Failed to analyze website content. Please try again or enter details manually.');
    }
  }
}