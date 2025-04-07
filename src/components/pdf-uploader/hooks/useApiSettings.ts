
import { useState, useEffect } from 'react';

export const useApiSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [provider, setProvider] = useState('openai');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useSimulationMode, setUseSimulationMode] = useState(false);

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('locnix_api_key');
    const savedProvider = localStorage.getItem('locnix_provider');
    const savedModel = localStorage.getItem('locnix_model');
    const savedSimMode = localStorage.getItem('locnix_simulation_mode');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProvider) setProvider(savedProvider);
    if (savedModel) setModel(savedModel);
    if (savedSimMode) setUseSimulationMode(savedSimMode === 'true');
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (apiKey) localStorage.setItem('locnix_api_key', apiKey);
    localStorage.setItem('locnix_provider', provider);
    localStorage.setItem('locnix_model', model);
    localStorage.setItem('locnix_simulation_mode', String(useSimulationMode));
  }, [apiKey, provider, model, useSimulationMode]);

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
