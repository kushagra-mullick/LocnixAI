
import { supabase } from '@/integrations/supabase/client';
import { Flashcard } from '../types/flashcard';

/**
 * Get flashcards from Supabase based on folder
 */
export const getFlashcards = async (folderId?: string) => {
  try {
    let query = supabase.from('flashcards').select('*');
    
    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(card => ({
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
 * Add a flashcard to Supabase
 */
export const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
  try {
    // First retrieve the current user's ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!userData.user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase.from('flashcards').insert({
      front: flashcard.front,
      back: flashcard.back,
      category: flashcard.category,
      folder_id: flashcard.folderId,
      user_id: userData.user.id // Include the user_id field
    }).select().single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding flashcard to Supabase', error);
    throw error;
  }
};

/**
 * Update a flashcard in Supabase
 */
export const updateFlashcardById = async (id: string, flashcard: Partial<Flashcard>) => {
  try {
    const updateData: any = {};
    if (flashcard.front) updateData.front = flashcard.front;
    if (flashcard.back) updateData.back = flashcard.back;
    if (flashcard.category !== undefined) updateData.category = flashcard.category;
    if (flashcard.difficulty) updateData.difficulty = flashcard.difficulty;
    if (flashcard.lastReviewed) updateData.last_reviewed = flashcard.lastReviewed.toISOString();
    if (flashcard.nextReviewDate) updateData.next_review_date = flashcard.nextReviewDate.toISOString();
    if (flashcard.folderId !== undefined) updateData.folder_id = flashcard.folderId;
    
    const { error } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating flashcard in Supabase', error);
    throw error;
  }
};

/**
 * Delete a flashcard from Supabase
 */
export const deleteFlashcardById = async (id: string) => {
  try {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting flashcard from Supabase', error);
    throw error;
  }
};

/**
 * Move flashcards to a different folder
 */
export const moveFlashcardsToFolder = async (flashcardIds: string[], folderId: string | null) => {
  try {
    const { error } = await supabase
      .from('flashcards')
      .update({ folder_id: folderId })
      .in('id', flashcardIds);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error moving flashcards in Supabase', error);
    throw error;
  }
};
