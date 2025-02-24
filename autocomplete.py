import urllib.request
import urllib.parse
import json
import time
from typing import List

class GoogleAutocomplete:
    def __init__(self):
        self.last_request_time = 0
        self.min_delay = 2  # Minimum delay between requests in seconds
        self.base_url = "https://suggestqueries.google.com/complete/search"
        
    def _wait_for_rate_limit(self):
        """Ensure we wait at least min_delay seconds between requests"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            time.sleep(self.min_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    def get_suggestions(self, query: str) -> List[str]:
        """
        Get Google autocomplete suggestions for a query
        
        Args:
            query: The search term to get suggestions for
            
        Returns:
            List of suggestion strings
        """
        self._wait_for_rate_limit()
        
        params = {
            'client': 'chrome',
            'q': query,
            'hl': 'es',  # Language set to Spanish
            'gl': 'es'   # Country set to Spain
        }
        
        url = f"{self.base_url}?{urllib.parse.urlencode(params)}"
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'es-ES,es;q=0.9'
            }
            request = urllib.request.Request(url, headers=headers)
            response = urllib.request.urlopen(request)
            data = json.loads(response.read().decode('utf-8'))
            
            # Google returns suggestions in the second element of the array
            return data[1] if len(data) > 1 else []
            
        except Exception as e:
            print(f"Error fetching suggestions: {str(e)}")
            return []

def main():
    autocomplete = GoogleAutocomplete()
    
    # Example searches
    test_queries = [
        "inmobiliarias zaragoza",
        "alquiler zaragoza",
        "pisos en zaragoza"
    ]
    
    for query in test_queries:
        print(f"\nSuggestions for '{query}':")
        suggestions = autocomplete.get_suggestions(query)
        for i, suggestion in enumerate(suggestions, 1):
            print(f"{i}. {suggestion}")

if __name__ == "__main__":
    main()