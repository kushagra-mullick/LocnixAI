
import React from 'react';
import { Key, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (show: boolean) => void;
  useSimulationMode: boolean;
  setUseSimulationMode: (use: boolean) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({
  provider,
  setProvider,
  model,
  setModel,
  apiKey,
  setApiKey,
  showApiKeyInput,
  setShowApiKeyInput,
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
            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Free)</SelectItem>
            <SelectItem value="gemini-pro-vision">Gemini Pro Vision (Free)</SelectItem>
          </>
        );
      default:
        return null;
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem('locnix_api_key');
    setApiKey('');
  };

  return (
    <>
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          variant="outline"
          className="gap-2"
        >
          <Key className="h-4 w-4" />
          {showApiKeyInput ? 'Hide API Settings' : 'API Settings'}
          {apiKey && !showApiKeyInput && (
            <Badge variant="success" className="ml-2 flex items-center gap-1 bg-green-500">
              <Check className="h-3 w-3" /> Saved
            </Badge>
          )}
        </Button>
      </div>
      
      {showApiKeyInput && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4 border">
          <div className="flex items-center space-x-2">
            <Switch 
              id="simulation-mode" 
              checked={useSimulationMode}
              onCheckedChange={setUseSimulationMode}
            />
            <Label htmlFor="simulation-mode">Use AI Simulation (No API Key Required)</Label>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-key">
                    {provider === 'openai' ? 'OpenAI API Key' : 
                     provider === 'anthropic' ? 'Anthropic API Key' : 
                     provider === 'perplexity' ? 'Perplexity API Key' : 
                     'Google API Key'}
                  </Label>
                  {apiKey && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearApiKey}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear saved key
                    </Button>
                  )}
                </div>
                <Input 
                  id="api-key"
                  type="password"
                  placeholder={apiKey ? '••••••••••••••••••••••••••' : `Enter your ${provider} API key`}
                  value={apiKey ? (apiKey.startsWith('saved:') ? '' : apiKey) : ''}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  {apiKey 
                    ? "Your API key is securely saved in your browser. You won't need to enter it again."
                    : "Your API key will be securely saved in your browser for future use."}
                </p>
              </div>
            </>
          )}

          {useSimulationMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm">
                Simulation Mode is ON. The app will generate sample flashcards without requiring an API key.
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
