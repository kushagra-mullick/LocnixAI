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
    if (!extractedText || extractedText.trim().length === 0) {
      toast({
        title: "No text to process",
        description: "Please upload a PDF first to extract text.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    // Start progress simulation
    startProgressSimulation();
    
    try {
      // Always use API mode, never fallback to simulation
      console.log(`Processing with ${provider} API using model ${model}`);
      
      // Always use the central API key
      const effectiveApiKey = API_CONFIGURATION.OPENAI_API_KEY;
      const flashcards = await generateFlashcardsWithAPI(provider, model, effectiveApiKey, extractedText);
      
      // Validate generated flashcards
      if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error("No flashcards were generated from the API");
      }
      
      // Process and validate the flashcards
      const validFlashcards = flashcards
        .filter(card => card && typeof card === 'object' && card.front && card.back)
        .map((card, index) => ({
          id: card.id || `card-${Date.now()}-${index}`,
          front: String(card.front).trim(),
          back: String(card.back).trim(),
          category: card.category || "PDF Extract"
        }));
      
      if (validFlashcards.length === 0) {
        throw new Error("No valid flashcards were generated");
      }
      
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
      
    } catch (error) {
      console.error('Error processing PDF with LLM:', error);
      setError(error instanceof Error ? error.message : "Failed to generate flashcards");
      
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: "Could not generate flashcards. Please try again or contact support.",
      });
      
      throw error; // Re-throw to handle in the component
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simulate progress while API processing is happening
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