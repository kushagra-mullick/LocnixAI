
import { Flashcard } from '../types/flashcard';

// Sample flashcard data for demonstration
export const sampleFlashcards: Flashcard[] = [
  {
    id: 'sample-1',
    front: 'What is the capital of France?',
    back: 'Paris is the capital of France.',
    category: 'Geography',
    dateCreated: new Date(),
    difficulty: 'easy'
  },
  {
    id: 'sample-2',
    front: 'What is the formula for water?',
    back: 'H₂O (two hydrogen atoms and one oxygen atom)',
    category: 'Chemistry',
    dateCreated: new Date(),
    difficulty: 'medium'
  },
  {
    id: 'sample-3',
    front: 'What year did World War II end?',
    back: '1945',
    category: 'History',
    dateCreated: new Date(),
    difficulty: 'medium'
  }
];
