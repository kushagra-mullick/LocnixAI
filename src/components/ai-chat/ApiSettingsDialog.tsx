
import React, { useState } from 'react';
import { Settings, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { API_CONFIGURATION } from '../pdf-uploader/services/api-config';

interface ApiSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModel: 'openai' | 'anthropic' | 'perplexity' | 'gemini';
  setSelectedModel: (model: 'openai' | 'anthropic' | 'perplexity' | 'gemini') => void;
  apiModel: string;
  setApiModel: (model: string) => void;
}

const ApiSettingsDialog: React.FC<ApiSettingsDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedModel,
  setSelectedModel,
  apiModel,
  setApiModel
}) => {
  const [newApiKey, setNewApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    if (newApiKey.trim()) {
      API_CONFIGURATION.OPENAI_API_KEY = newApiKey.trim();
      setNewApiKey('');
      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 3000);
    }
  };

  const handleClearApiKey = () => {
    API_CONFIGURATION.clearApiKey();
    setNewApiKey('');
    setApiKeySaved(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Model Settings</DialogTitle>
          <DialogDescription>
            Configure which AI service and model to use for the chat assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-service">AI Service</Label>
            <Select 
              value={selectedModel} 
              onValueChange={(value: any) => setSelectedModel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Model selection based on provider */}
          {selectedModel === 'openai' && (
            <div className="space-y-2">
              <Label htmlFor="openai-model">OpenAI Model</Label>
              <Select 
                value={apiModel} 
                onValueChange={setApiModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedModel === 'anthropic' && (
            <div className="space-y-2">
              <Label htmlFor="anthropic-model">Anthropic Model</Label>
              <Select 
                value={apiModel} 
                onValueChange={setApiModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                  <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedModel === 'perplexity' && (
            <div className="space-y-2">
              <Label htmlFor="perplexity-model">Perplexity Model</Label>
              <Select 
                value={apiModel} 
                onValueChange={setApiModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama-3.1-sonar-small-128k-online">Llama 3.1 Sonar (Small)</SelectItem>
                  <SelectItem value="llama-3.1-sonar-large-128k-online">Llama 3.1 Sonar (Large)</SelectItem>
                  <SelectItem value="llama-3.1-sonar-huge-128k-online">Llama 3.1 Sonar (Huge)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedModel === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="gemini-model">Gemini Model</Label>
              <Select 
                value={apiModel} 
                onValueChange={setApiModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* API Key Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="api-key-input">
              API Key <Lock className="h-4 w-4" />
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  id="api-key-input"
                  type={showApiKey ? "text" : "password"}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveApiKey} disabled={!newApiKey.trim()}>Save</Button>
              {API_CONFIGURATION.hasApiKey && (
                <Button onClick={handleClearApiKey} variant="destructive">Clear</Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Your API key will be stored locally in your browser and never sent to our servers.
            </p>
          </div>
            
          {apiKeySaved && (
            <Alert className="bg-green-50 text-green-800 border-green-500">
              <AlertDescription>API key saved successfully!</AlertDescription>
            </Alert>
          )}
            
          {!API_CONFIGURATION.hasApiKey && !API_CONFIGURATION.useSimulationMode && (
            <Alert className="bg-yellow-50 text-amber-800 border-amber-500">
              <AlertDescription>
                Please provide an API key to use the AI chat features.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettingsDialog;
