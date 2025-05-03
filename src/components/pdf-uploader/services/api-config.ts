
// Central configuration for API keys and settings
// This file provides fallback configuration while allowing for secure local storage of keys

// Get stored API key from local storage if available
const getStoredApiKey = (): string | null => {
  try {
    return localStorage.getItem('locnix_api_key');
  } catch (e) {
    return null;
  }
};

// Safe placeholder for API key in the repository
// IMPORTANT: This will be replaced by the user's stored key if available
const PLACEHOLDER_API_KEY = "";

export const API_CONFIGURATION = {
  // Get API key from local storage or use placeholder (empty string)
  get OPENAI_API_KEY(): string {
    return getStoredApiKey() || PLACEHOLDER_API_KEY;
  },
  
  // Set API key in local storage
  set OPENAI_API_KEY(value: string) {
    if (value) {
      localStorage.setItem('locnix_api_key', value);
    }
  },
  
  // Default settings
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
  
  // Enable this for development/testing without using API calls
  useSimulationMode: false,
  
  // Check if an API key is configured
  get hasApiKey(): boolean {
    return Boolean(getStoredApiKey());
  }
};

