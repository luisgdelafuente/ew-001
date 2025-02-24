import { GoogleAutocomplete } from './autocomplete.js';

async function main() {
  const autocomplete = new GoogleAutocomplete();
  const spainLocation = 'w+CAIQICIGRXNwYcOxYQ=='; // Encoded location for Spain
  
  const keywords = [
    'alquilar mi piso zaragoza', 
    'vender mi piso en zaragoza', 
    'alquiler seguro zaragoza'
  ];

  const allSuggestions = new Map(); // Map to store term -> weight

  for (const keyword of keywords) {
    console.log(`\nFetching suggestions for '${keyword}'...`);
    const suggestions = await autocomplete.getSuggestions(keyword, spainLocation);
    
    suggestions.forEach((suggestion, index) => {
      // Calculate weight: earlier positions in results get higher weight
      // Also consider which base keyword generated this suggestion
      const weight = (suggestions.length - index) / suggestions.length;
      
      if (allSuggestions.has(suggestion)) {
        // If term already exists, add to its weight
        allSuggestions.set(suggestion, allSuggestions.get(suggestion) + weight);
      } else {
        allSuggestions.set(suggestion, weight);
      }
    });
  }

  // Convert to array, sort by weight, and take top 10
  const sortedResults = [...allSuggestions.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  console.log('\nTop weighted suggestions:');
  sortedResults.forEach((result, index) => {
    const [term, weight] = result;
    console.log(`${index + 1}. ${term} (weight: ${weight.toFixed(3)})`);
  });
}

main().catch(console.error);