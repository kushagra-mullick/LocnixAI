
export interface LlmServiceProps {
  provider: string;
  model: string;
  apiKey: string;
  extractedText: string;
}

// Process with OpenAI
export const processWithOpenAI = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational flashcards from PDF content. Given the text extracted from a PDF, create a set of 10-15 high-quality question-answer flashcards. Focus on the most important concepts. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Format your response as a JSON array with objects containing 'front' (question), 'back' (answer), and 'category' fields."
        },
        {
          role: "user",
          content: `I've uploaded a PDF. Please generate flashcards from the PDF content. I'll paste some extracted text below. Use it to create flashcards in the format: [{"front": "question", "back": "answer", "category": "category"}].\n\n${extractedText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing for non-standard formats
        const cardMatches = content.match(/front["\s:]+([^"]+)["\s,]+back["\s:]+([^"]+)["\s,]+category["\s:]+([^"}\]]+)/g);
        if (cardMatches) {
          flashcards = cardMatches.map((match, index) => {
            const front = match.match(/front["\s:]+([^"]+)/)?.[1] || '';
            const back = match.match(/back["\s:]+([^"]+)/)?.[1] || '';
            const category = match.match(/category["\s:]+([^"}\]]+)/)?.[1]?.replace(/[",}]/g, '') || 'PDF Extract';
            return { id: `card-${Date.now()}-${index}`, front, back, category };
          });
        }
      }
      
      return flashcards;
    } catch (parseError) {
      console.error('Error parsing flashcard JSON:', parseError);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } else {
    const errorData = await response.json();
    console.error('API error:', errorData);
    throw new Error(`API Error: ${errorData.error?.message || "Unknown error"}`);
  }
};

// Process with Anthropic Claude
export const processWithAnthropic = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 4000,
      system: "You are an expert at creating educational flashcards from PDF content. Given the text extracted from a PDF, create a set of 10-15 high-quality question-answer flashcards. Focus on the most important concepts. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Format your response as a JSON array with objects containing 'front' (question), 'back' (answer), and 'category' fields.",
      messages: [
        {
          role: "user",
          content: `I've uploaded a PDF. Please generate flashcards from the PDF content. I'll paste some extracted text below. Use it to create flashcards in the format: [{"front": "question", "back": "answer", "category": "category"}].\n\n${extractedText}`
        }
      ]
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const content = data.content[0].text;
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to find JSON in response");
      }
      
      // Add IDs to flashcards
      return flashcards.map((card: any, index: number) => ({
        ...card,
        id: `card-${Date.now()}-${index}`
      }));
    } catch (parseError) {
      console.error('Error parsing flashcard JSON:', parseError);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } else {
    const errorData = await response.json();
    console.error('API error:', errorData);
    throw new Error(`API Error: ${errorData.error?.message || "Unknown error"}`);
  }
};

// Process with Perplexity
export const processWithPerplexity = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are an expert at creating educational flashcards from PDF content. Given the text extracted from a PDF, create a set of 10-15 high-quality question-answer flashcards. Focus on the most important concepts. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Format your response as a JSON array with objects containing 'front' (question), 'back' (answer), and 'category' fields."
        },
        {
          role: "user",
          content: `I've uploaded a PDF. Please generate flashcards from the PDF content. I'll paste some extracted text below. Use it to create flashcards in the format: [{"front": "question", "back": "answer", "category": "category"}].\n\n${extractedText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to find JSON in response");
      }
      
      // Add IDs to flashcards
      return flashcards.map((card: any, index: number) => ({
        ...card,
        id: `card-${Date.now()}-${index}`
      }));
    } catch (parseError) {
      console.error('Error parsing flashcard JSON:', parseError);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } else {
    const errorData = await response.json();
    console.error('API error:', errorData);
    throw new Error(`API Error: ${errorData.error?.message || "Unknown error"}`);
  }
};

// Process with Google Gemini
export const processWithGemini = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  // Adjust the endpoint for different Gemini models
  const isVisionModel = model === 'gemini-pro-vision';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:${isVisionModel ? 'generateContent' : 'generateContent'}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "You are an expert at creating educational flashcards from PDF content. Given the text extracted from a PDF, create a set of 10-15 high-quality question-answer flashcards. Focus on the most important concepts. Each flashcard should have a clear question on the front and a concise, informative answer on the back. Format your response as a JSON array with objects containing 'front' (question), 'back' (answer), and 'category' fields."
            }
          ]
        },
        {
          parts: [
            {
              text: `I've uploaded a PDF. Please generate flashcards from the PDF content. I'll paste some extracted text below. Use it to create flashcards in the format: [{"front": "question", "back": "answer", "category": "category"}].\n\n${extractedText}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to find JSON in response");
      }
      
      // Add IDs to flashcards
      return flashcards.map((card: any, index: number) => ({
        ...card,
        id: `card-${Date.now()}-${index}`
      }));
    } catch (parseError) {
      console.error('Error parsing flashcard JSON:', parseError);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } else {
    const errorData = await response.json();
    console.error('API error:', errorData);
    throw new Error(`API Error: ${errorData.error?.message || "Unknown error"}`);
  }
};

// Generate mock flashcards from extracted text without API
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
