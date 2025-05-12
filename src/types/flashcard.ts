
// Only adding the missing types that are not in the read-only file

// If this is a read-only file, we'll skip this update

// Make sure the FlashcardContextType includes the updated getFlashcardsForStudy signature
export interface FlashcardContextType {
  flashcards: Flashcard[];
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => void;
  addFlashcards: (flashcards: Omit<Flashcard, 'id' | 'dateCreated'>[]) => void;
  updateFlashcard: (id: string, flashcard: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  getFlashcard: (id: string) => Flashcard | undefined;
  getFlashcardsForStudy: (count?: number, specificFolderId?: string | null) => Flashcard[];
  rateFlashcard: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  isLoading: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (folderId: string | null) => void;
  moveFlashcards: (flashcardIds: string[], folderId: string | null) => void;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dateCreated: Date;
  lastReviewed?: Date;
  nextReviewDate?: Date;
  folderId?: string | null;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SharedDeck {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  share_code: string;
  created_at: string;
  updated_at: string;
  folders?: Folder;
}
