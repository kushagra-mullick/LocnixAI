
import { processWithOpenAI } from './services/openai-service';
import { processWithAnthropic } from './services/anthropic-service';
import { processWithPerplexity } from './services/perplexity-service';
import { processWithGemini } from './services/gemini-service';
import { generateMockFlashcards } from './services/mock-service';

export interface LlmServiceProps {
  provider: string;
  model: string;
  apiKey: string;
  extractedText: string;
}

export {
  processWithOpenAI,
  processWithAnthropic,
  processWithPerplexity,
  processWithGemini,
  generateMockFlashcards
};
