import React from 'react';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ApiSettingsProps {
  provider: string;
  setProvider: (provider: string) => void;
  model: string;
  setModel: (model: string) => void;
  showAdvancedSettings: boolean;
  setShowAdvancedSettings: (show: boolean) => void;
  useSimulationMode: boolean;
  setUseSimulationMode: (use: boolean) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  provider,
  setProvider,
  model,
  setModel,
  showAdvancedSettings,
  setShowAdvancedSettings,
  useSimulationMode,
  setUseSimulationMode
}) => {
  // Get model options based on selected provider
  const getModelOptions = () => {
    switch (provider) {
      case 'openai':
        return (
          <>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
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
            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
            <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
          </>
        );
      default:
        return null;
    }
  };

  // Display API key status - always show as ready
  const apiKeyStatus = (
    <Badge variant="outline" className="ml-2 bg-green-500 text-white">API Ready</Badge>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          variant="outline"
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {showAdvancedSettings ? 'Hide AI Settings' : 'AI Settings'}
          {apiKeyStatus}
        </Button>
      </div>
      
      {showAdvancedSettings && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4 border">
          <div className="flex items-center space-x-2">
            <Switch 
              id="simulation-mode" 
              checked={useSimulationMode}
              onCheckedChange={setUseSimulationMode}
            />
            <Label htmlFor="simulation-mode">Use AI Simulation (Save API Credits)</Label>
          </div>
          
          {!useSimulationMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ai-provider">AI Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
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
                <p className="text-xs text-gray-500">
                  Choose your preferred AI provider
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model-select">Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelOptions()}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                <p className="text-sm">
                  This app uses a central API key - no need to provide your own API key!
                </p>
              </div>
            </>
          )}

          {useSimulationMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm">
                Simulation Mode is ON. The app will generate sample flashcards without using API credits.
                While these won't be as high-quality as AI-generated ones, they'll help you test the app's functionality.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ApiSettings;
