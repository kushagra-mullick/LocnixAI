
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getModelOptions } from '../utils/model-options';

interface ModelSelectorProps {
  provider: 'openai' | 'anthropic' | 'perplexity' | 'gemini';
  model: string;
  onProviderChange: (value: 'openai' | 'anthropic' | 'perplexity' | 'gemini') => void;
  onModelChange: (value: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  provider,
  model,
  onProviderChange,
  onModelChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="ai-provider" className="block mb-1 text-gray-700 dark:text-gray-300">AI Provider</Label>
        <Select 
          value={provider} 
          onValueChange={(value: any) => onProviderChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select AI provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic Claude</SelectItem>
            <SelectItem value="perplexity">Perplexity</SelectItem>
            <SelectItem value="gemini">Google Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="ai-model" className="block mb-1 text-gray-700 dark:text-gray-300">Model</Label>
        <Select 
          value={model} 
          onValueChange={onModelChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {getModelOptions(provider)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModelSelector;
