import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { API_CONFIGURATION } from './services/api-config';

interface PdfViewerProps {
  previewUrl: string;
  isLoading: boolean;
  extractedText: string;
  error: string | null;
  progress: number;
  isProcessing: boolean;
  onGenerateFlashcards: () => void;
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
  provider,
  showApiKeyInput
}) => {
  const { toast } = useToast();
  const [showText, setShowText] = useState(false);

  const handleGenerate = () => {
    // API key is always available now
    onGenerateFlashcards();
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="bg-gray-50 dark:bg-gray-900 border rounded-md p-3 h-96 overflow-hidden flex flex-col">
          <div className="flex-grow overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p>Loading PDF...</p>
                </div>
              </div>
            ) : (
              <iframe src={previewUrl} className="w-full h-full" title="PDF preview" />
            )}
          </div>
          
          {!isLoading && extractedText && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowText(!showText)}
                >
                  {showText ? 'Hide' : 'Show'} Extracted Text
                </Button>
                <div className="text-sm">{extractedText.length} characters extracted</div>
              </div>
              
              {showText && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto text-sm">
                  {extractedText}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {!isLoading && extractedText && !error && (
        <div className="flex flex-col space-y-4">
          {isProcessing ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating flashcards...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          ) : (
            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={isProcessing}
            >
              Generate Flashcards with {provider}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
