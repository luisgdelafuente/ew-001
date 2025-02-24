import fetch from 'node-fetch';

export class GoogleAutocomplete {
  constructor() {
    this.lastRequestTime = 0;
    this.minDelay = 2000; // Minimum delay between requests in milliseconds
    this.baseUrl = 'https://suggestqueries.google.com/complete/search';
  }

  async waitForRateLimit() {
    const currentTime = Date.now();
    const timeSinceLast = currentTime - this.lastRequestTime;
    
    if (timeSinceLast < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLast));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getSuggestions(query, location = null) {
    await this.waitForRateLimit();

    const params = new URLSearchParams({
      client: 'chrome',
      q: query,
      hl: 'es', // Set language to Spanish
      gl: 'es', // Set country to Spain
      ds: '', // Restrict to general web search
    });

    if (location) {
      params.append('uule', location); // Add encoded location
    }

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'es-ES,es;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'X-Client-Data': 'CJW2yQEIpLbJAQipncoBCMKcygEIkqHLAQj6mM0BCIWgzQE=',
        }
      });

      const data = await response.json();
      return data[1] || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}