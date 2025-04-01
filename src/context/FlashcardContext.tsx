
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flashcard, FlashcardContextType } from '../types/flashcard';
import { sampleFlashcards } from '../data/sampleFlashcards';
import { calculateNextReviewDate } from '../utils/flashcardUtils';
import { getFlashcards, addFlashcard as saveFlashcard, updateFlashcardById, deleteFlashcardById } from '../services/supabase';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();

  // Load flashcards when auth state changes
  useEffect(() => {
    const loadFlashcards = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const cards = await getFlashcards();
          setFlashcards(cards);
        } catch (error) {
          console.error('Error loading flashcards from Supabase', error);
          // Use empty array as fallback instead of sample flashcards
          setFlashcards([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Use localStorage for non-authenticated users
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
          setFlashcards([]); // Use empty array instead of sample data
        }
        setIsLoading(false);
      }
    };

    loadFlashcards();

    // Set up realtime subscription for flashcards when authenticated
    if (isAuthenticated) {
      const subscription = supabase
        .channel('public:flashcards')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'flashcards',
        }, () => {
          // Reload flashcards when changes occur
          loadFlashcards();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [isAuthenticated, user]);

  // Save flashcards to localStorage only when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }
  }, [flashcards, isAuthenticated, isLoading]);

  const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
    if (isAuthenticated) {
      try {
        const newCard = await saveFlashcard(flashcard);
        setFlashcards(prev => [...prev, {
          ...newCard,
          id: newCard.id,
          dateCreated: new Date(newCard.date_created),
          lastReviewed: newCard.last_reviewed ? new Date(newCard.last_reviewed) : undefined,
          nextReviewDate: newCard.next_review_date ? new Date(newCard.next_review_date) : undefined
        } as Flashcard]);
      } catch (error) {
        console.error('Error saving flashcard to Supabase', error);
      }
    } else {
      // Local storage fallback
      const newFlashcard: Flashcard = {
        ...flashcard,
        id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dateCreated: new Date()
      };
      setFlashcards(prev => [...prev, newFlashcard]);
    }
  };

  const addFlashcards = async (newFlashcards: Omit<Flashcard, 'id' | 'dateCreated'>[]) => {
    if (isAuthenticated) {
      try {
        // Insert cards one by one (or use a batch operation if available)
        const promises = newFlashcards.map(card => saveFlashcard(card));
        await Promise.all(promises);
        // Reload all flashcards to ensure we have the latest data
        const cards = await getFlashcards();
        setFlashcards(cards);
      } catch (error) {
        console.error('Error saving multiple flashcards to Supabase', error);
      }
    } else {
      // Local storage fallback
      const formattedFlashcards: Flashcard[] = newFlashcards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        dateCreated: new Date()
      }));
      setFlashcards(prev => [...prev, ...formattedFlashcards]);
    }
  };

  const updateFlashcard = async (id: string, flashcard: Partial<Flashcard>) => {
    if (isAuthenticated) {
      try {
        await updateFlashcardById(id, flashcard);
        setFlashcards(prev =>
          prev.map(card =>
            card.id === id ? { ...card, ...flashcard } : card
          )
        );
      } catch (error) {
        console.error('Error updating flashcard in Supabase', error);
      }
    } else {
      // Local storage fallback
      setFlashcards(prev => 
        prev.map(card => 
          card.id === id ? { ...card, ...flashcard } : card
        )
      );
    }
  };

  const deleteFlashcard = async (id: string) => {
    if (isAuthenticated) {
      try {
        await deleteFlashcardById(id);
        setFlashcards(prev => prev.filter(card => card.id !== id));
      } catch (error) {
        console.error('Error deleting flashcard from Supabase', error);
      }
    } else {
      // Local storage fallback
      setFlashcards(prev => prev.filter(card => card.id !== id));
    }
  };

  const getFlashcard = (id: string): Flashcard | undefined => {
    return flashcards.find(card => card.id === id);
  };

  const rateFlashcard = async (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const now = new Date();
    const nextReviewDate = calculateNextReviewDate({ difficulty } as Flashcard, difficulty === 'easy' ? 5 : difficulty === 'medium' ? 3 : 1);
    
    const updatedCard = {
      difficulty,
      lastReviewed: now,
      nextReviewDate
    };

    if (isAuthenticated) {
      try {
        await updateFlashcardById(id, updatedCard);
        setFlashcards(prev =>
          prev.map(card =>
            card.id === id ? { ...card, ...updatedCard } : card
          )
        );
      } catch (error) {
        console.error('Error updating flashcard rating in Supabase', error);
      }
    } else {
      // Local storage fallback
      setFlashcards(prev =>
        prev.map(card =>
          card.id === id ? { ...card, ...updatedCard } : card
        )
      );
    }
  };

  const getFlashcardsForStudy = (): Flashcard[] => {
    const now = new Date();
    return flashcards.filter(card => {
      if (!card.nextReviewDate) return true;
      return card.nextReviewDate <= now;
    });
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
      rateFlashcard,
      isLoading
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
