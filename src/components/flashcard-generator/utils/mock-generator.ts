
interface FlashcardData {
  id: string;
  front: string;
  back: string;
  category: string;
}

// Helper function to generate smart mock flashcards from input text
export const generateMockFlashcards = (text: string): FlashcardData[] => {
  // Split the text into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Generate flashcards from important sentences (up to 7)
  return sentences.slice(0, Math.min(sentences.length, 7)).map((sentence, index) => {
    const words = sentence.trim().split(' ');
    
    // Find potentially important terms (longer words)
    const importantTerms = words.filter(word => word.length > 5).slice(0, 2);
    
    // Generate a question based on the sentence
    let question;
    if (importantTerms.length > 0) {
      question = `What is the significance of ${importantTerms.join(' and ')}?`;
    } else if (sentence.includes('is') || sentence.includes('are')) {
      question = sentence.replace(/(\w+)\s+(is|are)\s+/i, 'What $2 ').trim() + '?';
    } else {
      question = `What does the following statement explain: "${sentence.slice(0, 30)}..."?`;
    }
    
    const categories = ['Concept', 'Definition', 'Process', 'Example', 'Fact'];
    
    return {
      id: `mock-card-${Date.now()}-${index}`,
      front: question,
      back: sentence.trim(),
      category: categories[Math.floor(Math.random() * categories.length)]
    };
  });
};
