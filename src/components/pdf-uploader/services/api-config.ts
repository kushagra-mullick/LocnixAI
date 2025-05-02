
// Central configuration for API keys and settings
// This file stores the admin API key instead of requiring user input

export const API_CONFIGURATION = {
  // Add your API key here
  OPENAI_API_KEY: "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", // Replace with your actual OpenAI API key
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false
};
