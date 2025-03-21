export const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY
  }
};

if (!config.openai.apiKey) {
  throw new Error('Missing OpenAI API key. Please check your .env file.');
}