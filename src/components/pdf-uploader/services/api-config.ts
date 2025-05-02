
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
