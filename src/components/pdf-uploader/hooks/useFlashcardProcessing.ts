
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIGURATION } from '../services/api-config';
import { generateFlashcardsWithAPI } from '../services/flashcard-generator-service';
import { generateMockFlashcards } from '../services/mock-service';

export const useFlashcardProcessing = (
  extractedText: string, 
  onExtractComplete: (flashcards: any[]) => void,
  setError: (error: string | null) => void
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const processWithLLM = async (
    apiKey: string,
    provider: string,
    model: string,
    useSimulationMode: boolean
  ) => {
    if (!extractedText) {
      toast({
        title: "No text to process",
        description: "Please upload a PDF first to extract text.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null); // Clear any previous errors
    
    // Start progress simulation
    startProgressSimulation();
    
    try {
      let flashcards = [];
      
      if (useSimulationMode) {
        console.log("Using simulation mode for flashcard generation");
        toast({
          title: "Using Simulation Mode",
          description: "Generating sample flashcards without AI API."
        });
        
        flashcards = generateMockFlashcards(extractedText);
      } else {
        console.log(`Processing with ${provider} API using model ${model}`);
        
        // Always use the API key from api-config.ts
        const effectiveApiKey = apiKey || API_CONFIGURATION.OPENAI_API_KEY;
        
        if (!effectiveApiKey) {
          throw new Error("No API key available. Please check your configuration.");
        }
        
        flashcards = await generateFlashcardsWithAPI(provider, model, effectiveApiKey, extractedText);
      }
      
      if (Array.isArray(flashcards) && flashcards.length > 0) {
        // Validate and fix any malformed flashcards
        const validFlashcards = flashcards.filter(card => 
          card && typeof card === 'object' && card.front && card.back
        ).map((card, index) => ({
          id: card.id || `card-${Date.now()}-${index}`,
          front: String(card.front),
          back: String(card.back),
          category: card.category || "PDF Extract"
        }));
        
        if (validFlashcards.length > 0) {
          // Complete the progress bar
          setProgress(100);
          
          // Short delay to show completed progress before updating UI
          setTimeout(() => {
            onExtractComplete(validFlashcards);
            toast({
              title: "Flashcards created",
              description: `Successfully created ${validFlashcards.length} flashcards from your PDF.`
            });
          }, 500);
          return;
        } else {
          throw new Error("Failed to create valid flashcards. The AI response was malformed.");
        }
      } else {
        throw new Error("Failed to create flashcards. No cards were generated.");
      }
    } catch (processError) {
      console.error('Error processing PDF with LLM:', processError);
      setError("Error processing: " + (processError instanceof Error ? processError.message : "Unknown error"));
      
      // Only fall back to simulation mode if explicitly requested, not automatically
      if (useSimulationMode) {
        try {
          console.log("Already in simulation mode, but had an error. Retrying simulation.");
          const mockFlashcards = generateMockFlashcards(extractedText);
          onExtractComplete(mockFlashcards);
          toast({
            title: "Simulation mode",
            description: `Created ${mockFlashcards.length} sample flashcards.`,
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
          title: "API processing failed",
          description: "Failed to process with the AI API. Please try enabling simulation mode.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simulate progress while API or mock processing is happening
  const startProgressSimulation = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        // Gradually increase progress, slowing down as it approaches 90%
        const increment = Math.max(1, 10 * (1 - prevProgress / 100));
        const newProgress = Math.min(90, prevProgress + increment);
        
        if (newProgress >= 90) {
          clearInterval(interval);
        }
        
        return newProgress;
      });
    }, 300);
    
    // Clear interval after 30 seconds as a failsafe
    setTimeout(() => clearInterval(interval), 30000);
  };

  return {
    isProcessing,
    progress,
    processWithLLM
  };
};
