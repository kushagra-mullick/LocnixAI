
// Central configuration for API keys and settings
// This file provides configuration for API keys

// Default fallback API key (non-sensitive placeholder)
const DEFAULT_API_KEY = "use-your-own-key";

// Key for localStorage
const API_KEY_STORAGE_KEY = "locnix_api_key";

export const API_CONFIGURATION = {
  // Get API key from localStorage with fallback to default
  get OPENAI_API_KEY(): string {
    // Try to get from localStorage first
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    return storedKey || DEFAULT_API_KEY;
  },
  
  // Set API key to localStorage
  set OPENAI_API_KEY(value: string) {
    if (value && value.trim() !== "") {
      localStorage.setItem(API_KEY_STORAGE_KEY, value);
    }
  },
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false,
  
  // Check if we have an API key set
  get hasApiKey(): boolean {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    return !!storedKey && storedKey !== DEFAULT_API_KEY;
  },

  // Clear API key from localStorage
  clearApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
};
