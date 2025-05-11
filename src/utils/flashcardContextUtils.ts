import { Flashcard } from '../types/flashcard';
import { supabase } from '@/integrations/supabase/client';

/**
 * Load flashcards from Supabase database for a specific folder
 */
export const loadFlashcardsFromSupabase = async (selectedFolderId?: string) => {
  try {
    let query = supabase.from('flashcards').select('*');
    
    if (selectedFolderId) {
      query = query.eq('folder_id', selectedFolderId);
    } else {
      query = query.is('folder_id', null);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map((card: any) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      category: card.category,
      difficulty: card.difficulty,
      dateCreated: new Date(card.date_created || card.created_at),
      lastReviewed: card.last_reviewed ? new Date(card.last_reviewed) : undefined,
      nextReviewDate: card.next_review_date ? new Date(card.next_review_date) : undefined,
      folderId: card.folder_id
    })) as Flashcard[];
  } catch (error) {
    console.error('Error loading flashcards from Supabase', error);
    throw error;
  }
};

/**
 * Filters flashcards for study based on folder and review dates
 */
export const filterFlashcardsForStudy = (
  flashcards: Flashcard[],
  count: number = 10,
  specificFolderId?: string | null,
  selectedFolderId: string | null = null
): Flashcard[] => {
  const now = new Date();
  
  // Handle the folderId consistently - it can be explicitly null, a string ID, or undefined
  // If undefined is passed, we'll use the currently selected folder
  const effectiveFolderId = specificFolderId === undefined ? selectedFolderId : specificFolderId;
  
  console.log(`Getting study cards for folder ID: ${effectiveFolderId}`);
  console.log(`Total available flashcards: ${flashcards.length}`);
  
  // Filter flashcards by folder
  let folderFlashcards: Flashcard[] = [];
  
  if (effectiveFolderId === null) {
    // Get cards without any folder (folderId is null or undefined)
    folderFlashcards = flashcards.filter(card => !card.folderId);
    console.log(`Filtered for uncategorized cards: found ${folderFlashcards.length} cards`);
  } else {
    // Get cards for a specific folder
    folderFlashcards = flashcards.filter(card => card.folderId === effectiveFolderId);
    console.log(`Filtered for folder ID ${effectiveFolderId}: found ${folderFlashcards.length} cards`);
  }
  
  // If no cards in this folder, return empty array
  if (folderFlashcards.length === 0) {
    console.log('No cards available in this folder');
    return [];
  }
  
  // Find due cards in the selected folder
  const dueCards = folderFlashcards.filter(card => {
    if (!card.nextReviewDate) return true; // Cards not studied yet are always due
    return card.nextReviewDate <= now;
  });
  
  console.log(`Due cards in folder: ${dueCards.length}`);
  
  // If we have enough due cards, return them
  if (dueCards.length >= count) {
    return dueCards.slice(0, count);
  }
  
  // Otherwise, include cards we haven't studied yet from the same folder
  const unstudiedCards = folderFlashcards.filter(card => !card.lastReviewed);
  const combinedCards = [...dueCards, ...unstudiedCards];
  
  console.log(`Combined due and unstudied cards: ${combinedCards.length}`);
  
  // If we still don't have enough cards, just return what we have
  if (combinedCards.length >= count) {
    return combinedCards.slice(0, count);
  }
  
  // If we still need more cards, just return all cards from the folder
  console.log(`Returning all available folder cards: ${folderFlashcards.length}`);
  return folderFlashcards.slice(0, count);
};
