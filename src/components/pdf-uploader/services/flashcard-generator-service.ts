
import { processWithOpenAI } from './openai-service';
import { processWithAnthropic } from './anthropic-service';
import { processWithPerplexity } from './perplexity-service';
import { processWithGemini } from './gemini-service';

/**
 * Generate flashcards using the selected provider's API
 * 
 * @param provider The AI provider to use (openai, anthropic, perplexity, gemini)
 * @param model The specific model from the provider
 * @param apiKey The API key for authentication
 * @param text The text content to generate flashcards from
 * @returns An array of flashcard objects
 */
export const generateFlashcardsWithAPI = async (
  provider: string,
  model: string,
  apiKey: string,
  text: string
) => {
  console.log(`Generating flashcards with ${provider} using model ${model}`);
  
  try {
    switch (provider) {
      case 'openai':
        return await processWithOpenAI(apiKey, model, text);
        
      case 'anthropic':
        return await processWithAnthropic(apiKey, model, text);
        
      case 'perplexity':
        return await processWithPerplexity(apiKey, model, text);
        
      case 'gemini':
        return await processWithGemini(apiKey, model, text);
        
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider} API:`, error);
    throw new Error(`${provider} API Error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};
