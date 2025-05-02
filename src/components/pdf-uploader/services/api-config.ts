
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
