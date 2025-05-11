
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

export interface FlashcardContextType {
  flashcards: Flashcard[];
  addFlashcard: (flashcard: Omit<Flashcard, 'id' | 'dateCreated'>) => void;
  addFlashcards: (flashcards: Omit<Flashcard, 'id' | 'dateCreated'>[]) => void;
  updateFlashcard: (id: string, flashcard: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  getFlashcard: (id: string) => Flashcard | undefined;
  getFlashcardsForStudy: (count?: number) => Flashcard[];
  rateFlashcard: (id: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  isLoading: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  moveFlashcards: (ids: string[], folderId: string | null) => void;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedDeck {
  id: string;
  name: string;
  description?: string;
  share_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  folder_id: string;
  folders: Folder;
}
