
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  dateCreated: Date;
  lastReviewed?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  nextReviewDate?: Date;
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
}
