# Google Search Suggestions Analyzer

A Node.js tool that analyzes Google search suggestions for real estate related terms, calculating relative weights for each suggestion.

## Features

- Fetches Google search suggestions for multiple keywords
- Supports location-based suggestions (currently set to Florida, US)
- Calculates weighted relevance for each suggestion
- Returns top 10 most relevant terms

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
```

2. Install dependencies:
```bash
npm install
```

## Usage

Run the analyzer:
```bash
node index.js
```

## Configuration

- Location and language settings can be modified in `autocomplete.js`
- Search keywords can be adjusted in `index.js`

## Dependencies

- node-fetch: ^3.3.2