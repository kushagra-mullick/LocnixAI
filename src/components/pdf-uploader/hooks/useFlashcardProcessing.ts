
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  processWithOpenAI, 
  processWithAnthropic, 
  processWithPerplexity, 
  processWithGemini,
  generateMockFlashcards
} from '../llm-service';

export const useFlashcardProcessing = (
  extractedText: string, 
  onExtractComplete: (flashcards: any[]) => void,
  setError: (error: string | null) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processWithLLM = async (
    apiKey: string,
    provider: string,
    model: string,
    useSimulationMode: boolean
  ) => {
    if (!extractedText) {
      return;
    }
    
    if (!useSimulationMode && !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key or enable Simulation Mode to process the PDF.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let flashcards = [];
      
      if (useSimulationMode) {
        // Use simulation mode - generate mock flashcards
        toast({
          title: "Using Simulation Mode",
          description: "Generating sample flashcards without AI API."
        });
        
        flashcards = generateMockFlashcards(extractedText);
      } else {
        // Use actual API based on provider selection
        switch (provider) {
          case 'openai':
            flashcards = await processWithOpenAI(apiKey, model, extractedText);
            break;
          case 'anthropic':
            flashcards = await processWithAnthropic(apiKey, model, extractedText);
            break;
          case 'perplexity':
            flashcards = await processWithPerplexity(apiKey, model, extractedText);
            break;
          case 'gemini':
            flashcards = await processWithGemini(apiKey, model, extractedText);
            break;
          default:
            throw new Error("Unsupported provider");
        }
      }
      
      if (flashcards.length > 0) {
        onExtractComplete(flashcards);
        toast({
          title: "Flashcards created",
          description: `Successfully created ${flashcards.length} flashcards from your PDF.`
        });
      } else {
        throw new Error("Failed to create flashcards. No cards were generated.");
      }
    } catch (processError) {
      console.error('Error processing PDF with LLM:', processError);
      setError("Error processing: " + (processError instanceof Error ? processError.message : "Unknown error"));
      
      // Fall back to simulation mode if API fails
      if (!useSimulationMode) {
        try {
          const mockFlashcards = generateMockFlashcards(extractedText);
          onExtractComplete(mockFlashcards);
          toast({
            title: "Fallback to simulation mode",
            description: `Created ${mockFlashcards.length} sample flashcards due to API error.`,
            variant: "default"
          });
        } catch (fallbackError) {
          toast({
            title: "Processing failed",
            description: "Could not generate flashcards. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Processing failed",
          description: "Failed to generate flashcards from the PDF content.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processWithLLM
  };
};
