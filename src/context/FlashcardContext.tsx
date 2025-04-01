import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flashcard, FlashcardContextType } from '../types/flashcard';
import { sampleFlashcards } from '../data/sampleFlashcards';
import { calculateNextReviewDate } from '../utils/flashcardUtils';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load flashcards from localStorage on initial render
  useEffect(() => {
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
        setFlashcards(sampleFlashcards); // Use sample data if error
      }
    } else {
      setFlashcards(sampleFlashcards); // Use sample data if no saved data
    }
  }, []);

  // Save flashcards to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
    const newFlashcard: Flashcard = {
      ...flashcard,
      id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dateCreated: new Date()
    };
    setFlashcards(prev => [...prev, newFlashcard]);
  };

  const addFlashcards = (newFlashcards: Omit<Flashcard, 'id' | 'dateCreated'>[]) => {
    const formattedFlashcards: Flashcard[] = newFlashcards.map((card, index) => ({
      ...card,
      id: `card-${Date.now()}-${index}`,
      dateCreated: new Date()
    }));
    setFlashcards(prev => [...prev, ...formattedFlashcards]);
  };

  const updateFlashcard = (id: string, flashcard: Partial<Flashcard>) => {
    setFlashcards(prev => 
      prev.map(card => 
        card.id === id ? { ...card, ...flashcard } : card
      )
    );
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(prev => prev.filter(card => card.id !== id));
  };

  const getFlashcard = (id: string) => {
    return flashcards.find(card => card.id === id);
  };

  const rateFlashcard = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const now = new Date();
    const nextReviewDate = calculateNextReviewDate(difficulty);
    
    updateFlashcard(id, {
      difficulty,
      lastReviewed: now,
      nextReviewDate
    });
  };

  // Get cards due for review, prioritizing those overdue
  const getFlashcardsForStudy = (count = 10): Flashcard[] => {
    const now = new Date();
    
    // First, get cards that are due for review
    const dueFlashcards = flashcards.filter(card => 
      card.nextReviewDate ? card.nextReviewDate <= now : true
    );
    
    // If we have enough due cards, return them
    if (dueFlashcards.length >= count) {
      return dueFlashcards.slice(0, count);
    }
    
    // Otherwise, add cards that have never been reviewed
    const neverReviewed = flashcards.filter(card => !card.lastReviewed);
    
    let result = [...dueFlashcards, ...neverReviewed];
    
    // If we still don't have enough, add the most recently reviewed cards
    if (result.length < count) {
      const remaining = flashcards
        .filter(card => !result.includes(card))
        .sort((a, b) => {
          const dateA = a.lastReviewed || a.dateCreated;
          const dateB = b.lastReviewed || b.dateCreated;
          return dateA.getTime() - dateB.getTime();
        });
      
      result = [...result, ...remaining.slice(0, count - result.length)];
    }
    
    return result.slice(0, count);
  };

  return (
    <FlashcardContext.Provider value={{
      flashcards,
      addFlashcard,
      addFlashcards,
      updateFlashcard,
      deleteFlashcard,
      getFlashcard,
      getFlashcardsForStudy,
      rateFlashcard
    }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

// Re-export the Flashcard interface to maintain backward compatibility
export type { Flashcard };
