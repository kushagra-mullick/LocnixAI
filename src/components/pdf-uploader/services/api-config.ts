
// Central configuration for API keys and settings
// This file provides centralized API key handling

// Default API key that can be overridden with environment variables
const DEFAULT_API_KEY = "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";

// Get API key from environment variable if available, otherwise use default
const getCentralApiKey = (): string => {
  // For production deployment with environment variables
  if (typeof import.meta.env.VITE_OPENAI_API_KEY === 'string' && 
      import.meta.env.VITE_OPENAI_API_KEY.trim() !== '') {
    return import.meta.env.VITE_OPENAI_API_KEY;
  }
  
  // Fallback to default key
  return DEFAULT_API_KEY;
};

export const API_CONFIGURATION = {
  // Always return the central API key
  get OPENAI_API_KEY(): string {
    return getCentralApiKey();
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
