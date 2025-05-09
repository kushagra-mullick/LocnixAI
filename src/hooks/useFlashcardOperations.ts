
import { useFlashcards } from '../context/FlashcardContext';
import type { Flashcard } from '../types/flashcard';
import { createFolder, getFolders, getSharedDecks, importSharedDeck } from '../services/supabase';

export const useFlashcardOperations = () => {
  const flashcardContext = useFlashcards();
  
  const createFlashcard = (front: string, back: string, category?: string, folderId?: string) => {
    flashcardContext.addFlashcard({
      front,
      back,
      category,
      folderId: folderId || flashcardContext.selectedFolderId
    });
  };
  
  const createFlashcardsFromBatch = (flashcardData: { front: string, back: string, category?: string }[]) => {
    flashcardContext.addFlashcards(flashcardData.map(card => ({
      ...card,
      folderId: flashcardContext.selectedFolderId
    })));
  };
  
  const studySession = (count: number = 10) => {
    return flashcardContext.getFlashcardsForStudy(count);
  };
  
  const recordFlashcardRating = (id: string, difficulty: 'easy' | 'medium' | 'hard') => {
    flashcardContext.rateFlashcard(id, difficulty);
  };
  
  const deleteFlashcard = (id: string) => {
    flashcardContext.deleteFlashcard(id);
  };
  
  const moveFlashcardsToFolder = (flashcardIds: string[], folderId: string | null) => {
    flashcardContext.moveFlashcards(flashcardIds, folderId);
  };
  
  const createNewFolder = async (name: string, description?: string) => {
    return await createFolder(name, description);
  };
  
  const loadFolders = async () => {
    return await getFolders();
  };
  
  const loadSharedDecks = async () => {
    return await getSharedDecks();
  };
  
  const importDeck = async (shareCode: string, newFolderName: string) => {
    return await importSharedDeck(shareCode, newFolderName);
  };
  
  const setCurrentFolder = (folderId: string | null) => {
    flashcardContext.setSelectedFolderId(folderId);
  };
  
  return {
    ...flashcardContext,
    createFlashcard,
    createFlashcardsFromBatch,
    studySession,
    recordFlashcardRating,
    deleteFlashcard,
    moveFlashcardsToFolder,
    createNewFolder,
    loadFolders,
    loadSharedDecks,
    importDeck,
    setCurrentFolder
  };
};
