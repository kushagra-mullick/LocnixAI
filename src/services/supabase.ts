
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";
import { Provider } from "@supabase/supabase-js";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signInWithOAuth = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
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
export const getFlashcards = async (folderId?: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  let query = supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.user.id);
    
  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }
  
  const { data, error } = await query;
  
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
      folder_id: flashcard.folderId,
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
      folder_id: flashcard.folderId,
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

// Folder operations
export const getFolders = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.user.id);
  
  if (error) throw error;
  return data;
};

export const getFolder = async (id: string) => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createFolder = async (name: string, description?: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: user.user.id,
      name,
      description
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFolder = async (id: string, name: string, description?: string) => {
  const { data, error } = await supabase
    .from('folders')
    .update({
      name,
      description,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFolder = async (id: string) => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
};

// Move flashcards to a folder
export const moveFlashcardsToFolder = async (flashcardIds: string[], folderId: string | null) => {
  const { data, error } = await supabase
    .from('flashcards')
    .update({ folder_id: folderId })
    .in('id', flashcardIds)
    .select();
  
  if (error) throw error;
  return data;
};

// Shared decks operations
export const createSharedDeck = async (name: string, folderId: string, description?: string, isPublic: boolean = false) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  // Generate a random share code
  const shareCode = Math.random().toString(36).substring(2, 10);
  
  const { data, error } = await supabase
    .from('shared_decks')
    .insert({
      user_id: user.user.id,
      folder_id: folderId,
      name,
      description,
      is_public: isPublic,
      share_code: shareCode
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSharedDecks = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('shared_decks')
    .select('*, folders(*)')
    .eq('user_id', user.user.id);
  
  if (error) throw error;
  return data;
};

export const getSharedDeckByCode = async (shareCode: string) => {
  const { data, error } = await supabase
    .from('shared_decks')
    .select('*, folders(*)')
    .eq('share_code', shareCode)
    .single();
  
  if (error) throw error;
  
  // Now get all flashcards in this folder
  const { data: flashcardsData, error: flashcardsError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('folder_id', data.folders.id);
  
  if (flashcardsError) throw flashcardsError;
  
  return { 
    deck: data, 
    flashcards: flashcardsData.map(card => ({
      ...card,
      id: card.id,
      front: card.front,
      back: card.back,
      category: card.category,
      difficulty: card.difficulty,
      dateCreated: new Date(card.date_created),
      lastReviewed: card.last_reviewed ? new Date(card.last_reviewed) : undefined,
      nextReviewDate: card.next_review_date ? new Date(card.next_review_date) : undefined
    })) as Flashcard[]
  };
};

export const updateSharedDeck = async (id: string, name: string, description?: string, isPublic: boolean = false) => {
  const { data, error } = await supabase
    .from('shared_decks')
    .update({
      name,
      description,
      is_public: isPublic,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSharedDeck = async (id: string) => {
  const { error } = await supabase
    .from('shared_decks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return { success: true };
};

// Import a shared deck to your account
export const importSharedDeck = async (shareCode: string, newFolderName: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("User not authenticated");
  
  // Get the shared deck
  const { deck, flashcards } = await getSharedDeckByCode(shareCode);
  
  // Create a new folder for the imported deck
  const folder = await createFolder(newFolderName || `${deck.name} (Imported)`, deck.description);
  
  // Create new flashcards in the folder
  const promises = flashcards.map(card => 
    addFlashcard({
      front: card.front,
      back: card.back,
      category: card.category,
      difficulty: card.difficulty,
      folderId: folder.id
    })
  );
  
  await Promise.all(promises);
  
  return { success: true, folder };
};
