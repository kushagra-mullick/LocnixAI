
export const generateMockFlashcards = (text: string) => {
  // Split the text into paragraphs and sentences
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  // Prepare categories
  const categories = ['Definition', 'Concept', 'Process', 'Fact', 'Example'];
  
  // Generate flashcards (between 8-12)
  const numCards = Math.min(Math.max(8, Math.floor(sentences.length / 5)), 12);
  const flashcards = [];
  
  // Use paragraphs for content if available
  const contentSource = paragraphs.length >= 5 ? paragraphs : sentences;
  const step = Math.max(1, Math.floor(contentSource.length / numCards));
  
  for (let i = 0; i < numCards && i * step < contentSource.length; i++) {
    const content = contentSource[i * step].trim();
    if (content.length < 10) continue;
    
    // Create a question from the content
    let question;
    if (content.length > 100) {
      question = `What is the main point of: "${content.substring(0, 50)}..."?`;
    } else {
      const words = content.split(' ');
      if (content.toLowerCase().includes('what is') || content.toLowerCase().includes('how to')) {
        question = content.trim() + '?';
      } else if (words.length > 6) {
        const keywordIndex = Math.floor(words.length / 2);
        const keyword = words[keywordIndex].replace(/[^\w\s]/gi, '');
        question = `What is the significance of "${keyword}" in this context?`;
      } else {
        question = `What does the following mean: "${content}"?`;
      }
    }
    
    flashcards.push({
      id: `mock-card-${Date.now()}-${i}`,
      front: question,
      back: content,
      category: categories[i % categories.length]
    });
  }
  
  // Add some specific question types if we have enough content
  if (contentSource.length > 10) {
    // Definition card
    const termIndex = Math.floor(Math.random() * contentSource.length);
    const termContent = contentSource[termIndex].trim();
    const words = termContent.split(' ');
    if (words.length > 3) {
      const term = words.slice(0, 2).join(' ');
      flashcards.push({
        id: `mock-card-${Date.now()}-term`,
        front: `Define: ${term}`,
        back: termContent,
        category: 'Definition'
      });
    }
    
    // Comparison card if we have enough content
    if (contentSource.length > 20) {
      const item1 = contentSource[Math.floor(contentSource.length * 0.25)].trim().split(' ').slice(0, 2).join(' ');
      const item2 = contentSource[Math.floor(contentSource.length * 0.75)].trim().split(' ').slice(0, 2).join(' ');
      flashcards.push({
        id: `mock-card-${Date.now()}-compare`,
        front: `Compare and contrast: ${item1} vs ${item2}`,
        back: `${item1}: ${contentSource[Math.floor(contentSource.length * 0.25)].trim()}\n\n${item2}: ${contentSource[Math.floor(contentSource.length * 0.75)].trim()}`,
        category: 'Comparison'
      });
    }
  }
  
  return flashcards;
};
