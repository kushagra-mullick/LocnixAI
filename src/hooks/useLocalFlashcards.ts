
import { useState, useEffect } from 'react';
import { Flashcard } from '../types/flashcard';

/**
 * Hook for managing flashcards in local storage for non-authenticated users
 */
export const useLocalFlashcards = (isAuthenticated: boolean) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load flashcards from localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      const savedFlashcards = localStorage.getItem('flashcards');
      if (savedFlashcards) {
        try {
          const parsedFlashcards = JSON.parse(savedFlashcards);
          // Convert string dates back to Date objects
          const processedFlashcards = parsedFlashcards.map((card: any) => ({
            ...card,
            dateCreated: new Date(card.dateCreated),
            lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
            nextReviewDate: card.nextReviewDate ? new Date(card.nextReviewDate) : undefined
          }));
          setFlashcards(processedFlashcards);
        } catch (error) {
          console.error('Error parsing flashcards from localStorage', error);
          setFlashcards([]); // Use empty array if error
        }
      } else {
        setFlashcards([]); // Use empty array if no saved flashcards
      }
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Save flashcards to localStorage when they change
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }
  }, [flashcards, isAuthenticated, isLoading]);
  
  return { flashcards, setFlashcards, isLoading, setIsLoading };
};
