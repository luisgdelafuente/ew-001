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

  // Location encoding map for specific countries
  getLocationCode(country) {
    const locationMap = {
      'us': 'w+CAIQICINVW5pdGVkIFN0YXRlcw==', // United States
      'es': 'w+CAIQICIGRXNwYcOxYQ==', // Spain
      'uk': 'w+CAIQICIKVW5pdGVkIEtpbmdkb20=', // United Kingdom
      'fr': 'w+CAIQICIGRnJhbmNl', // France
      'de': 'w+CAIQICIHRwZXJtYW55', // Germany
      'it': 'w+CAIQICIGSXRhbHk=', // Italy
      'pt': 'w+CAIQICIJUw9ydHVnYWw=', // Portugal
      'mx': 'w+CAIQICIGTWXhpY28=', // Mexico
      'ar': 'w+CAIQICIJQXJnZW50aW5h', // Argentina
      'cl': 'w+CAIQICIFQw5pbGU=' // Chile
    };
    return locationMap[country] || '';
  }

  createJSONPScript(url, callbackName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      window[callbackName] = (data) => {
        delete window[callbackName];
        document.body.removeChild(script);
        resolve(data);
      };

      script.src = url;
      script.onerror = () => {
        delete window[callbackName];
        document.body.removeChild(script);
        reject(new Error('Failed to load JSONP script'));
      };
      document.body.appendChild(script);
    });
  }

  async getSuggestions(query, country = 'us', language = 'en') {
    await this.waitForRateLimit();

    const callbackName = 'googleComplete' + Date.now();
    const locationCode = this.getLocationCode(country);
    
    const params = new URLSearchParams({
      client: 'chrome',
      q: query,
      hl: language, // Language parameter
      gl: country, // Country/region parameter
      ds: '', // Restrict to general web search
      callback: callbackName
    });

    if (locationCode) {
      params.append('uule', locationCode); // Add encoded location
    }

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const data = await this.createJSONPScript(url, callbackName);
      return data[1] || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }
}