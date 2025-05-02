
// Central configuration for API keys and settings
// This file stores the admin API key instead of requiring user input

export const API_CONFIGURATION = {
  // Add your API key here
  OPENAI_API_KEY: "YOUR_OPENAI_API_KEY_HERE", // Replace with your actual OpenAI API key
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false
};
