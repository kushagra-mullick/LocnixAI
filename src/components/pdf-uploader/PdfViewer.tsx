
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  previewUrl: string | null;
  isLoading: boolean;
  extractedText: string;
  error: string | null;
  progress: number;
  isProcessing: boolean;
  onGenerateFlashcards: () => void;
  apiKey: string;
  provider: string;
  showApiKeyInput: boolean;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  previewUrl,
  isLoading,
  extractedText,
  error,
  progress,
  isProcessing,
  onGenerateFlashcards,
  apiKey,
  provider,
  showApiKeyInput
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <Card className="glass-card overflow-hidden h-96">
        <CardContent className="p-0 h-full">
          {previewUrl && (
            <iframe 
              src={previewUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          )}
        </CardContent>
      </Card>
      
      <Card className="glass-card overflow-hidden h-96">
        <CardContent className="p-4 h-full overflow-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">Loading PDF: {progress}%</p>
            </div>
          ) : extractedText ? (
            <TextContent 
              extractedText={extractedText}
              isProcessing={isProcessing}
              onGenerateFlashcards={onGenerateFlashcards}
              apiKey={apiKey}
              provider={provider}
              showApiKeyInput={showApiKeyInput}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Upload a PDF to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface TextContentProps {
  extractedText: string;
  isProcessing: boolean;
  onGenerateFlashcards: () => void;
  apiKey: string;
  provider: string;
  showApiKeyInput: boolean;
}

const TextContent: React.FC<TextContentProps> = ({
  extractedText,
  isProcessing,
  onGenerateFlashcards,
  apiKey,
  provider,
  showApiKeyInput
}) => {
  return (
    <div>
      <h3 className="font-medium mb-2">PDF Content Status</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {extractedText}
      </p>
      
      <GenerateFlashcardsButton 
        isProcessing={isProcessing}
        onGenerateFlashcards={onGenerateFlashcards}
        apiKey={apiKey}
        provider={provider}
      />
      
      {!apiKey.trim() && !showApiKeyInput && (
        <p className="text-xs text-amber-600 mt-2">
          Please enter your {provider === 'openai' ? 'OpenAI' : 
                           provider === 'anthropic' ? 'Anthropic' : 
                           provider === 'perplexity' ? 'Perplexity' : 
                           'Google'} API key in API Settings to continue.
        </p>
      )}
    </div>
  );
};

interface GenerateFlashcardsButtonProps {
  isProcessing: boolean;
  onGenerateFlashcards: () => void;
  apiKey: string;
  provider: string;
}

const GenerateFlashcardsButton: React.FC<GenerateFlashcardsButtonProps> = ({
  isProcessing,
  onGenerateFlashcards,
  apiKey,
  provider
}) => {
  return (
    <Button 
      onClick={onGenerateFlashcards}
      disabled={isProcessing || !apiKey.trim()}
      className="w-full gap-2 mt-4"
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing with {provider === 'openai' ? 'OpenAI' : 
                        provider === 'anthropic' ? 'Claude' : 
                        provider === 'perplexity' ? 'Perplexity' : 
                        'Gemini'}...
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          Generate Flashcards with {provider === 'openai' ? 'OpenAI' : 
                                 provider === 'anthropic' ? 'Claude' : 
                                 provider === 'perplexity' ? 'Perplexity' : 
                                 'Gemini'}
        </>
      )}
    </Button>
  );
};

export default PdfViewer;
