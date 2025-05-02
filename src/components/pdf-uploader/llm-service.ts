
import { generateFlashcardsWithAPI } from './services/flashcard-generator-service';
import { generateMockFlashcards } from './services/mock-service';

export interface LlmServiceProps {
  provider: string;
  model: string;
  apiKey: string;
  extractedText: string;
}

// Re-export the functions for backward compatibility
export {
  generateFlashcardsWithAPI,
  generateMockFlashcards
};
