// Central configuration for API keys and settings
// This file provides the hardcoded API key for all users

// Your fixed API key that all users will use
const CENTRAL_API_KEY = "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";

export const API_CONFIGURATION = {
  // Always return the central API key
  get OPENAI_API_KEY(): string {
    return CENTRAL_API_KEY;
  },
  
  // No need to set API key anymore, but keep method for compatibility
  set OPENAI_API_KEY(value: string) {
    // Do nothing - we don't allow users to change the API key
    console.log("API key cannot be changed - using central key");
  },
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false,
  
  // Always return true since we have a central API key
  get hasApiKey(): boolean {
    return true;
  },

  // Clear API key does nothing now
  clearApiKey(): void {
    // Do nothing - we don't allow users to clear the API key
    console.log("API key cannot be cleared - using central key");
  }
};
