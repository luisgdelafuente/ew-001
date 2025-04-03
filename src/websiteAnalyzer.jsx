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

    // Check for common error page indicators
    const errorPageIndicators = [
      'Error 404', 'Page Not Found', '404 Not Found', 
      'Domain Default page', 'Parked Domain', 'Website Coming Soon',
      'Account Suspended', 'This domain is not configured'
    ];

    const formattedUrl = this.formatUrl(url);
    const urlVariants = this.generateUrlVariants(formattedUrl);
    const corsProxies = [
      'https://proxy.cors.sh/',
      'https://corsproxy.io/?',
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
          div.innerHTML = html.trim();

          // Check for error pages
          const pageText = div.textContent.trim();
          if (errorPageIndicators.some(indicator => 
              pageText.toLowerCase().includes(indicator.toLowerCase()))) {
            throw new Error('This appears to be an error page or parked domain');
          }

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
          // Extract metadata with priority
          const metaTags = {
            companyName: div.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
                        div.querySelector('meta[name="application-name"]')?.getAttribute('content'),
            description: div.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                        div.querySelector('meta[name="description"]')?.getAttribute('content'),
            title: div.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   div.querySelector('title')?.textContent
          };

          if (metaTags.description?.length > 50) {
            content += metaTags.description + '\n\n';
          }

          // Prioritized content areas
          const mainSelectors = [
            // Brand/Company identifiers
            '.brand', '.logo-text', '.company-name', '#company-name',
            '[class*="brand"]', '[class*="logo"]', '[id*="brand"]',
            // About section with high priority
            '[class*="about"]:not(footer *)', '[id*="about"]:not(footer *)',
            // Products/Services sections
            '[class*="products"]:not(footer *)', '[id*="products"]:not(footer *)',
            '[class*="services"]:not(footer *)', '[id*="services"]:not(footer *)',
            // Main content areas
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
            Array.from(div.querySelectorAll(selector)).forEach(element => {
              // Skip if element is hidden
              const style = window.getComputedStyle(element);
              if (style.display === 'none' || style.visibility === 'hidden') {
                return;
              }

              const text = element.textContent
                ?.trim()
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n');

              if (text?.length > 15 && !processedTexts.has(text)) {
                processedTexts.add(text);
                content += text + '\n\n';
              }
            });
          });

          // Try to extract links to important pages for additional context
          const importantLinks = Array.from(div.querySelectorAll('a'))
            .filter(link => {
              const href = link.getAttribute('href');
              const text = link.textContent.toLowerCase();
              return href && !href.startsWith('#') && 
                     (text.includes('about') || text.includes('products') || 
                      text.includes('services') || text.includes('company'));
            })
            .map(link => new URL(link.href, url).href)
            .slice(0, 3); // Limit to 3 important pages

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

          if (content.length > 0) {
            return {
              content,
              metadata: metaTags,
              importantLinks
            };
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }
    }

    throw new Error('Failed to access website content');
  }

  async analyzeContent(content) {
    if (!content?.content?.trim()) {
      throw new Error('No content provided for analysis');
    }

    try {
      const prompts = getSystemPrompts(this.language);
      const metadata = content.metadata || {};
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: `You are a business analyst specializing in company identification and analysis.
Task: Extract accurate company information from website content and metadata.

Guidelines for company name extraction:
1. Prioritize official sources in this order:
   - meta[property="og:site_name"]
   - meta[name="application-name"]
   - Brand name in logo/header
   - Company name mentioned in about section
2. Remove legal entities (Inc, Ltd, etc)
3. Clean up any extra text or descriptions
4. If multiple variations exist, choose the most commonly used one

Guidelines for activity analysis:
1. Focus on core business activities and value proposition
2. Include main products/services offered
3. Identify target market/audience
4. Note any unique selling points or specializations
5. If content seems incomplete, indicate what information is missing

Return a JSON object with:
- companyName: Clean, accurate company name
- activity: Comprehensive 3-4 sentence description in ${this.language}`
        }, {
          role: "user",
          content: `Analyze this website content and metadata:

Metadata:
${JSON.stringify(metadata, null, 2)}

Main Content:
${content.content.substring(0, 2000)}

Important Links Found:
${content.importantLinks?.join('\n') || 'No additional pages found'}`
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