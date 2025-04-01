import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, name?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    }
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
};

// Flashcards database operations
export const getFlashcards = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.user.id);
  
  if (error) throw error;
  
  // Convert string dates to Date objects
  return data.map(card => ({
    ...card,
    id: card.id,
    front: card.front,
    back: card.back,
    category: card.category,
    difficulty: card.difficulty,
    dateCreated: new Date(card.date_created),
    lastReviewed: card.last_reviewed ? new Date(card.last_reviewed) : undefined,
    nextReviewDate: card.next_review_date ? new Date(card.next_review_date) : undefined
  })) as Flashcard[];
};

export const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      user_id: user.user.id,
      front: flashcard.front,
      back: flashcard.back,
      category: flashcard.category,
      difficulty: flashcard.difficulty,
      last_reviewed: flashcard.lastReviewed?.toISOString(),
      next_review_date: flashcard.nextReviewDate?.toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFlashcardById = async (id: string, flashcard: Partial<Flashcard>) => {
  const { data, error } = await supabase
    .from('flashcards')
    .update({
      front: flashcard.front,
      back: flashcard.back,
      category: flashcard.category,
      difficulty: flashcard.difficulty,
      last_reviewed: flashcard.lastReviewed?.toISOString(),
      next_review_date: flashcard.nextReviewDate?.toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFlashcardById = async (id: string) => {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
};
