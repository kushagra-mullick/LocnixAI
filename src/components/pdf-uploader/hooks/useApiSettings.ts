
import { useState, useEffect } from 'react';
import { API_CONFIGURATION } from '../services/api-config';

export const useApiSettings = () => {
  const [model, setModel] = useState(API_CONFIGURATION.defaultModel);
  const [provider, setProvider] = useState(API_CONFIGURATION.defaultProvider);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [useSimulationMode, setUseSimulationMode] = useState(API_CONFIGURATION.useSimulationMode);

  // Load saved model and provider settings from localStorage on component mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('locnix_provider');
    const savedModel = localStorage.getItem('locnix_model');
    const savedSimMode = localStorage.getItem('locnix_simulation_mode');
    
    if (savedProvider) setProvider(savedProvider);
    if (savedModel) setModel(savedModel);
    if (savedSimMode) setUseSimulationMode(savedSimMode === 'true');
  }, []);

  // Save provider and model settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('locnix_provider', provider);
    localStorage.setItem('locnix_model', model);
    localStorage.setItem('locnix_simulation_mode', String(useSimulationMode));
  }, [provider, model, useSimulationMode]);

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
        setModel('gemini-1.5-flash');
        break;
      default:
        break;
    }
  }, [provider]);

  return {
    model,
    setModel,
    provider,
    setProvider,
    showAdvancedSettings,
    setShowAdvancedSettings,
    useSimulationMode,
    setUseSimulationMode
  };
};
