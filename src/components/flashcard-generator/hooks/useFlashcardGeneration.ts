
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  generateWithOpenAI, 
  generateWithAnthropic, 
  generateWithPerplexity, 
  generateWithGemini 
} from '../services/flashcard-generator-service';
import { generateMockFlashcards } from '../utils/mock-generator';
import { API_CONFIGURATION } from '../../pdf-uploader/services/api-config';
import { getDefaultModelForProvider } from '../utils/model-options';

interface UseFlashcardGenerationProps {
  onFlashcardsGenerated?: (flashcards: any[]) => void;
}

export const useFlashcardGeneration = ({ onFlashcardsGenerated }: UseFlashcardGenerationProps = {}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'perplexity' | 'gemini'>('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const { toast } = useToast();

  // Load saved API settings from localStorage on component mount
  useEffect(() => {
    const savedProvider = localStorage.getItem('locnix_provider');
    const savedModel = localStorage.getItem('locnix_model');
    
    if (savedProvider) {
      console.log(`Found saved provider: ${savedProvider}`);
      setSelectedProvider(savedProvider as any);
    }
    if (savedModel) {
      console.log(`Found saved model: ${savedModel}`);
      setSelectedModel(savedModel);
    }
  }, []);
  
  // Save API settings to localStorage whenever they change
  useEffect(() => {
    if (selectedProvider) {
      localStorage.setItem('locnix_provider', selectedProvider);
      console.log(`Saved provider to localStorage: ${selectedProvider}`);
    }
    if (selectedModel) {
      localStorage.setItem('locnix_model', selectedModel);
      console.log(`Saved model to localStorage: ${selectedModel}`);
    }
  }, [selectedProvider, selectedModel]);

  // Update default model when provider changes
  useEffect(() => {
    setSelectedModel(getDefaultModelForProvider(selectedProvider));
  }, [selectedProvider]);
  
  const generateFlashcards = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please provide some text to generate flashcards from.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setApiError(null);
    
    try {
      // Simulate progress while waiting for API response
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 100);
      
      let flashcardsData;
      const useSimulation = API_CONFIGURATION.useSimulationMode;
      
      if (useSimulation) {
        console.log("Using simulation mode");
        // Generate mock flashcards if simulation mode is enabled
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        // Generate smart mock flashcards based on input text
        flashcardsData = generateMockFlashcards(inputText);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(flashcardsData);
        }
        
        toast({
          title: "Using AI simulation",
          description: "Generated simulated flashcards."
        });
        
        setIsGenerating(false);
        setInputText('');
        return;
      }
      
      console.log(`Using ${selectedProvider} API with model ${selectedModel}`);
      
      // Make API call based on selected provider
      try {
        switch (selectedProvider) {
          case 'openai':
            flashcardsData = await generateWithOpenAI(inputText, selectedModel);
            break;
          case 'anthropic':
            flashcardsData = await generateWithAnthropic(inputText, selectedModel);
            break;
          case 'perplexity':
            flashcardsData = await generateWithPerplexity(inputText, selectedModel);
            break;
          case 'gemini':
            flashcardsData = await generateWithGemini(inputText, selectedModel);
            break;
          default:
            console.error("Invalid provider, falling back to simulation");
            flashcardsData = generateMockFlashcards(inputText);
        }
      
        clearInterval(progressInterval);
        setGenerationProgress(100);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(flashcardsData);
        }
        
        toast({
          title: "Flashcards generated",
          description: `Successfully created ${flashcardsData.length} flashcards.`
        });
      } catch (apiError) {
        console.error('API error:', apiError);
        clearInterval(progressInterval);
        
        setApiError(apiError instanceof Error ? apiError.message : "Unknown API error");
        
        // Fall back to simulation if there was an API error
        console.log("API error - falling back to simulation mode");
        const mockFlashcards = generateMockFlashcards(inputText);
        
        if (onFlashcardsGenerated) {
          onFlashcardsGenerated(mockFlashcards);
        }
        
        toast({
          title: "API Error",
          description: "Error with AI provider. Used simulation mode as fallback.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('General error:', error);
      
      // General error handler
      setApiError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsGenerating(false);
      setInputText('');
    }
  };

  return {
    inputText,
    setInputText,
    isGenerating,
    generationProgress,
    apiError,
    setApiError,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    generateFlashcards
  };
};
