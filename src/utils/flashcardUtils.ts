
// Simple spaced repetition implementation
export const calculateNextReviewDate = (difficulty: 'easy' | 'medium' | 'hard'): Date => {
  const now = new Date();
  
  switch (difficulty) {
    case 'easy':
      return new Date(now.setDate(now.getDate() + 7)); // Review in 7 days
    case 'medium':
      return new Date(now.setDate(now.getDate() + 3)); // Review in 3 days
    case 'hard':
      return new Date(now.setDate(now.getDate() + 1)); // Review in 1 day
    default:
      return new Date(now.setDate(now.getDate() + 3));
  }
};
