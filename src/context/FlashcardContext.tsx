
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flashcard, FlashcardContextType } from '../types/flashcard';
import { calculateNextReviewDate } from '../utils/flashcardUtils';
import { filterFlashcardsForStudy } from '../utils/flashcardContextUtils';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocalFlashcards } from '../hooks/useLocalFlashcards';
import * as flashcardService from '../services/flashcardService';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Use the local flashcards hook for non-authenticated users
  const localFlashcards = useLocalFlashcards(isAuthenticated);

  // Load flashcards when auth state changes or selected folder changes
  useEffect(() => {
    const loadFlashcards = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const cards = await flashcardService.getFlashcards(selectedFolderId || undefined);
          setFlashcards(cards);
        } catch (error) {
          console.error('Error loading flashcards from Supabase', error);
          setFlashcards([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // For non-authenticated users, we use the local flashcards hook
        setFlashcards(localFlashcards.flashcards);
        setIsLoading(localFlashcards.isLoading);
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
  }, [isAuthenticated, user, selectedFolderId, localFlashcards.flashcards, localFlashcards.isLoading]);

  // For non-authenticated users, we need to update the local flashcards hook when flashcards change
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localFlashcards.setFlashcards(flashcards);
    }
  }, [isAuthenticated, flashcards, isLoading]);

  const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
    if (isAuthenticated) {
      try {
        const newCard = await flashcardService.addFlashcard({
          ...flashcard,
          folderId: selectedFolderId
        });
        setFlashcards(prev => [...prev, {
          ...newCard,
          id: newCard.id,
          dateCreated: new Date(newCard.date_created),
          lastReviewed: newCard.last_reviewed ? new Date(newCard.last_reviewed) : undefined,
          nextReviewDate: newCard.next_review_date ? new Date(newCard.next_review_date) : undefined,
          folderId: newCard.folder_id
        } as Flashcard]);
      } catch (error) {
        console.error('Error saving flashcard to Supabase', error);
      }
    } else {
      // Local storage fallback
      const newFlashcard: Flashcard = {
        ...flashcard,
        id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        dateCreated: new Date(),
        folderId: selectedFolderId
      };
      setFlashcards(prev => [...prev, newFlashcard]);
    }
  };

  const addFlashcards = async (newFlashcards: Omit<Flashcard, 'id' | 'dateCreated'>[]) => {
    if (isAuthenticated) {
      try {
        // Insert cards one by one (or use a batch operation if available)
        const promises = newFlashcards.map(card => flashcardService.addFlashcard({
          ...card,
          folderId: selectedFolderId
        }));
        await Promise.all(promises);
        // Reload all flashcards to ensure we have the latest data
        const cards = await flashcardService.getFlashcards(selectedFolderId || undefined);
        setFlashcards(cards);
      } catch (error) {
        console.error('Error saving multiple flashcards to Supabase', error);
      }
    } else {
      // Local storage fallback
      const formattedFlashcards: Flashcard[] = newFlashcards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        dateCreated: new Date(),
        folderId: selectedFolderId
      }));
      setFlashcards(prev => [...prev, ...formattedFlashcards]);
    }
  };

  const updateFlashcard = async (id: string, flashcard: Partial<Flashcard>) => {
    if (isAuthenticated) {
      try {
        await flashcardService.updateFlashcardById(id, flashcard);
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
        await flashcardService.deleteFlashcardById(id);
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
        await flashcardService.updateFlashcardById(id, updatedCard);
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

  const getFlashcardsForStudy = (count: number = 10, specificFolderId?: string | null): Flashcard[] => {
    return filterFlashcardsForStudy(flashcards, count, specificFolderId, selectedFolderId);
  };

  const moveFlashcards = async (flashcardIds: string[], folderId: string | null) => {
    if (isAuthenticated) {
      try {
        await flashcardService.moveFlashcardsToFolder(flashcardIds, folderId);
        
        // Update local state
        setFlashcards(prev => {
          const updatedCards = [...prev];
          flashcardIds.forEach(id => {
            const index = updatedCards.findIndex(card => card.id === id);
            if (index !== -1) {
              updatedCards[index] = { ...updatedCards[index], folderId };
            }
          });
          return updatedCards;
        });
      } catch (error) {
        console.error('Error moving flashcards in Supabase', error);
      }
    } else {
      // Local storage fallback
      setFlashcards(prev => {
        return prev.map(card => 
          flashcardIds.includes(card.id) ? { ...card, folderId } : card
        );
      });
    }
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
      isLoading,
      selectedFolderId,
      setSelectedFolderId,
      moveFlashcards
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
