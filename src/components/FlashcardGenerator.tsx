
import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle } from 'lucide-react';

// Import components and hooks
import { useFlashcardGeneration } from './flashcard-generator/hooks/useFlashcardGeneration';
import FlashcardInput from './flashcard-generator/components/FlashcardInput';
import ModelSelector from './flashcard-generator/components/ModelSelector';
import ProgressBar from './flashcard-generator/components/ProgressBar';

interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

const FlashcardGenerator = ({ onFlashcardsGenerated }: { onFlashcardsGenerated?: (flashcards: any[]) => void }) => {
  const {
    inputText,
    setInputText,
    isGenerating,
    generationProgress,
    apiError,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    generateFlashcards
  } = useFlashcardGeneration({ onFlashcardsGenerated });

  // Show API as ready since we're using a preset key
  const apiStatus = <Badge className="ml-2 bg-green-500 text-white">API Ready</Badge>;
  
  return (
    <Card className="glass-card w-full max-w-3xl mx-auto p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Brain className="h-5 w-5" />
          <h3 className="text-xl">AI Flashcard Generator</h3>
          {apiStatus}
        </div>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Error</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        
        <FlashcardInput
          inputText={inputText}
          onInputChange={setInputText}
          onGenerate={generateFlashcards}
          isGenerating={isGenerating}
        />
        
        {/* AI Provider and Model Selection */}
        <ModelSelector
          provider={selectedProvider}
          model={selectedModel}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
        />
        
        <ProgressBar 
          isGenerating={isGenerating}
          progress={generationProgress}
        />
      </div>
    </Card>
  );
};

export default FlashcardGenerator;
