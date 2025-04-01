
import { Flashcard } from '@/types/flashcard';

/**
 * Calculate the next review date based on the difficulty rating
 * Easy: +5 days, Medium: +3 days, Hard: +1 day
 */
export const calculateNextReviewDate = (flashcard: Flashcard, rating: number | string): Date => {
  const now = new Date();
  let daysToAdd = 0;
  
  // Handle both number and string formats for compatibility
  if (typeof rating === 'number') {
    daysToAdd = rating;
  } else if (rating === 'easy') {
    daysToAdd = 5;
  } else if (rating === 'medium') {
    daysToAdd = 3;
  } else if (rating === 'hard') {
    daysToAdd = 1;
  }
  
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate;
};
