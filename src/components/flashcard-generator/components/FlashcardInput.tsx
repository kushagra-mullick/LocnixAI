
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRightCircle, Loader2 } from 'lucide-react';

interface FlashcardInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const FlashcardInput: React.FC<FlashcardInputProps> = ({
  inputText,
  onInputChange,
  onGenerate,
  isGenerating
}) => {
  return (
    <>
      <Textarea 
        placeholder="Paste your notes, textbook excerpts, or any learning material here..."
        className="min-h-32 text-base p-4 focus:ring-2 focus:ring-primary/50 transition-all"
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
      />
      
      <div className="flex flex-col items-center gap-4 mt-4">
        <Button 
          onClick={onGenerate}
          disabled={isGenerating || !inputText.trim()}
          className="w-full max-w-xs rounded-full py-6 shadow-md hover:shadow-lg transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Flashcards
              <ArrowRightCircle className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );
};

export default FlashcardInput;
