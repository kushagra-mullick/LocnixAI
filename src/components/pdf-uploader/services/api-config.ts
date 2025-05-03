
// Central configuration for API keys and settings
// This file provides configuration for API keys

// Your pre-set API key (replace this with your actual API key)
const PRESET_API_KEY = "your-api-key-goes-here";

export const API_CONFIGURATION = {
  // Always return the preset API key
  get OPENAI_API_KEY(): string {
    return PRESET_API_KEY;
  },
  
  // No-op set function to maintain API compatibility
  set OPENAI_API_KEY(value: string) {
    // This is intentionally left empty as we're using a preset key
    console.log("Note: Using preset API key - custom API keys are not supported");
  },
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false,
  
  // Always returns true since we always have a preset key
  get hasApiKey(): boolean {
    return true;
  }
};
