import React, { createContext, useContext, useState, useEffect } from 'react';
import { Flashcard, FlashcardContextType } from '../types/flashcard';
import { sampleFlashcards } from '../data/sampleFlashcards';
import { calculateNextReviewDate } from '../utils/flashcardUtils';
import { getFlashcards, addFlashcard as saveFlashcard, updateFlashcardById, deleteFlashcardById, moveFlashcardsToFolder } from '../services/supabase';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const FlashcardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Load flashcards when auth state changes or selected folder changes
  useEffect(() => {
    const loadFlashcards = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const cards = await getFlashcards(selectedFolderId || undefined);
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
            // If we have 0 flashcards in our sample data, we might want to clear localStorage
            if (sampleFlashcards.length === 0) {
              // Clear localStorage to ensure we start fresh
              localStorage.removeItem('flashcards');
              setFlashcards([]);
            } else {
              // Convert string dates back to Date objects
              const processedFlashcards = parsedFlashcards.map((card: any) => ({
                ...card,
                dateCreated: new Date(card.dateCreated),
                lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
                nextReviewDate: card.nextReviewDate ? new Date(card.nextReviewDate) : undefined
              }));
              setFlashcards(processedFlashcards);
            }
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
  }, [isAuthenticated, user, selectedFolderId]);

  // Save flashcards to localStorage only when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      localStorage.setItem('flashcards', JSON.stringify(flashcards));
    }
  }, [flashcards, isAuthenticated, isLoading]);

  const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
    if (isAuthenticated) {
      try {
        const newCard = await saveFlashcard({
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
        const promises = newFlashcards.map(card => saveFlashcard({
          ...card,
          folderId: selectedFolderId
        }));
        await Promise.all(promises);
        // Reload all flashcards to ensure we have the latest data
        const cards = await getFlashcards(selectedFolderId || undefined);
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

  // Updated getFlashcardsForStudy to accept a specific folderId
  const getFlashcardsForStudy = (count: number = 10, specificFolderId?: string | null): Flashcard[] => {
    const now = new Date();
    const folderId = specificFolderId !== undefined ? specificFolderId : selectedFolderId;
    
    // Filter flashcards by folder if specified
    const folderFlashcards = folderId !== null 
      ? flashcards.filter(card => card.folderId === folderId)
      : flashcards;
    
    if (folderFlashcards.length === 0) {
      return [];
    }
    
    // Find due cards in the selected folder
    const dueCards = folderFlashcards.filter(card => {
      if (!card.nextReviewDate) return true;
      return card.nextReviewDate <= now;
    });
    
    // If we have enough due cards, return them
    if (dueCards.length >= count) {
      return dueCards.slice(0, count);
    }
    
    // Otherwise, include cards we haven't studied yet from the same folder
    const unstudiedCards = folderFlashcards.filter(card => !card.lastReviewed);
    const combinedCards = [...dueCards, ...unstudiedCards];
    
    // If we still don't have enough cards, just return what we have
    if (combinedCards.length >= count) {
      return combinedCards.slice(0, count);
    }
    
    // If we still need more cards, include any cards from the folder
    return folderFlashcards.slice(0, count);
  };

  const moveFlashcards = async (flashcardIds: string[], folderId: string | null) => {
    if (isAuthenticated) {
      try {
        await moveFlashcardsToFolder(flashcardIds, folderId);
        
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
