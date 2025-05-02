
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
