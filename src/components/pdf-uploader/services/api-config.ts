
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
