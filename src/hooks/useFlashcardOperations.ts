
import { useFlashcards } from '../context/FlashcardContext';
import type { Flashcard } from '../types/flashcard';

export const useFlashcardOperations = () => {
  const flashcardContext = useFlashcards();
  
  const createFlashcard = (front: string, back: string, category?: string) => {
    flashcardContext.addFlashcard({
      front,
      back,
      category
    });
  };
  
  const createFlashcardsFromBatch = (flashcardData: { front: string, back: string, category?: string }[]) => {
    flashcardContext.addFlashcards(flashcardData);
  };
  
  const studySession = (count: number = 10) => {
    return flashcardContext.getFlashcardsForStudy(count);
  };
  
  const recordFlashcardRating = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    flashcardContext.rateFlashcard(id, difficulty);
  };
  
  const deleteFlashcard = (id: string) => {
    flashcardContext.deleteFlashcard(id);
  };
  
  return {
    ...flashcardContext,
    createFlashcard,
    createFlashcardsFromBatch,
    studySession,
    recordFlashcardRating,
    deleteFlashcard
  };
};
