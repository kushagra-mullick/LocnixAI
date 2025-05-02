
import React from 'react';
import { SelectItem } from '@/components/ui/select';

export const getModelOptions = (provider: string) => {
  switch (provider) {
    case 'openai':
      return (
        <>
          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
        </>
      );
    case 'anthropic':
      return (
        <>
          <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
          <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
          <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
        </>
      );
    case 'perplexity':
      return (
        <>
          <SelectItem value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar (Small)</SelectItem>
          <SelectItem value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar (Large)</SelectItem>
          <SelectItem value="llama-3.1-sonar-huge-128k-online">Llama 3.1 Sonar (Huge)</SelectItem>
        </>
      );
    case 'gemini':
      return (
        <>
          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
        </>
      );
    default:
      return null;
  }
};

export const getDefaultModelForProvider = (provider: string): string => {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'perplexity':
      return 'llama-3.1-sonar-small-128k-online';
    case 'gemini':
      return 'gemini-pro';
    default:
      return 'gpt-4o-mini';
  }
};
