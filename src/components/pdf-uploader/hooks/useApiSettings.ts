
import { useState, useEffect } from 'react';

export const useApiSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [provider, setProvider] = useState('openai');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useSimulationMode, setUseSimulationMode] = useState(false);

  // Update default model when provider changes
  useEffect(() => {
    switch (provider) {
      case 'openai':
        setModel('gpt-4o');
        break;
      case 'anthropic':
        setModel('claude-3-haiku-20240307');
        break;
      case 'perplexity':
        setModel('llama-3.1-sonar-small-128k-online');
        break;
      case 'gemini':
        setModel('gemini-1.5-flash'); // Default to free Gemini model
        break;
      default:
        break;
    }
  }, [provider]);

  return {
    apiKey,
    setApiKey,
    model,
    setModel,
    provider,
    setProvider,
    showApiKeyInput,
    setShowApiKeyInput,
    useSimulationMode,
    setUseSimulationMode
  };
};
