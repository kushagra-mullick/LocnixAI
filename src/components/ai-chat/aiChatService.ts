
import { API_CONFIGURATION } from '../pdf-uploader/services/api-config';
import { Flashcard } from '@/types/flashcard';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIServiceResponse {
  content: string;
}

// Function to simulate AI response (fallback when no API key is provided)
export const simulateAIResponse = async (message: string, previousMessages: Message[], flashcards: Flashcard[]): Promise<string> => {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your flashcard assistant. How can I help you with your learning today?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('can you')) {
    return "I can help you with your flashcards in several ways:\n\n1. Explain concepts from your flashcards\n2. Quiz you on your flashcards\n3. Suggest learning strategies\n4. Help you create better flashcards\n\nWhat would you like help with?";
  }
  
  if (lowerMessage.includes('flashcard') && (lowerMessage.includes('create') || lowerMessage.includes('make'))) {
    return "Creating effective flashcards is an art! Here are some tips:\n\n• Keep each card focused on a single concept\n• Use clear, concise language\n• Include examples where helpful\n• For language learning, include context\n• Review your cards regularly using spaced repetition";
  }
  
  if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('remember')) {
    return "The most effective way to study with flashcards is using spaced repetition. Review cards more frequently when you're struggling with them, and less frequently as you master them. Study in short, focused sessions rather than cramming, and make sure to actively recall the information rather than just reading it.";
  }
  
  if (lowerMessage.includes('how many') && lowerMessage.includes('flashcard')) {
    return `You currently have ${flashcards.length} flashcards in your collection.`;
  }
  
  // Default response
  return "I understand you're asking about your flashcards. To give you the most helpful response, could you provide more specific details about what you'd like to know or learn?";
};

// Function to call OpenAI API
export const callOpenAI = async (message: string, previousMessages: Message[], flashcards: Flashcard[]): Promise<string> => {
  try {
    const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
    messagesToSend.push({ role: 'user', content: message });
    
    // Add context about flashcards
    const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
      `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
    ).join('\n');
    
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`
    };
    
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIGURATION.model || 'gpt-4o-mini',
        messages: [systemMessage, ...messagesToSend],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

// Function to call Anthropic API
export const callAnthropic = async (message: string, previousMessages: Message[], flashcards: Flashcard[]): Promise<string> => {
  try {
    const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
    messagesToSend.push({ role: 'user', content: message });
    
    // Add context about flashcards
    const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
      `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
    ).join('\n');
    
    const systemMessage = `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`;
    
    const messages = messagesToSend.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
    
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: API_CONFIGURATION.model || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: systemMessage,
        messages: messages
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling Anthropic API');
    }
    
    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
};

// Function to call Perplexity API
export const callPerplexity = async (message: string, previousMessages: Message[], flashcards: Flashcard[]): Promise<string> => {
  try {
    const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
    messagesToSend.push({ role: 'user', content: message });
    
    // Add context about flashcards
    const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
      `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
    ).join('\n');
    
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards. Provide helpful, educational responses about the content in these flashcards or about learning strategies.`
    };
    
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIGURATION.model || 'llama-3.1-sonar-small-128k-online',
        messages: [systemMessage, ...messagesToSend],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling Perplexity API');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw error;
  }
};

// Function to call Gemini API
export const callGemini = async (message: string, previousMessages: Message[], flashcards: Flashcard[]): Promise<string> => {
  try {
    const messagesToSend = previousMessages.filter(msg => msg.role !== 'system').slice(-6);
    messagesToSend.push({ role: 'user', content: message });
    
    // Add context about flashcards
    const flashcardContext = flashcards.slice(0, 10).map((card, i) => 
      `Card ${i+1}: Front: "${card.front}" Back: "${card.back}" Category: ${card.category || 'Uncategorized'}`
    ).join('\n');
    
    const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are an AI assistant specialized in helping users learn with flashcards. Here are some of the user's flashcards for context:\n\n${flashcardContext}\n\nThe user has a total of ${flashcards.length} flashcards.`
              }
            ]
          },
          ...messagesToSend.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling Gemini API');
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

// Helper function to extract flashcards from text
export const extractFlashcardsFromText = (text: string): Array<{front: string; back: string; category?: string}> => {
  // Clean the text before processing
  const cleanText = text
    .replace(/^#+\s+/gm, '') // Remove markdown headings
    .replace(/\*\*/g, '')    // Remove bold markdown
    .replace(/\*/g, '')      // Remove italic markdown
    .replace(/`/g, '')       // Remove code ticks
    .replace(/^\d+\.\s+/gm, ''); // Remove numbered lists
  
  // First try to find flashcards with explicit question/answer patterns
  const explicitPatterns = [
    // Q&A pattern
    /(?:Question|Q|Front):\s*["']?(.*?)["']?\s*(?:Answer|A|Back):\s*["']?(.*?)["']?(?=\n\s*(?:Question|Q|Front):|$)/gis,
    
    // Front/Back pattern
    /(?:Front|Question):\s*["']?(.*?)["']?\s*(?:Back|Answer):\s*["']?(.*?)["']?(?=\n\s*(?:Front|Question):|$)/gis,
    
    // Numbered pattern with Q&A
    /\d+\s*[\.\)]\s*(?:Question|Q|Front):\s*["']?(.*?)["']?\s*(?:Answer|A|Back):\s*["']?(.*?)["']?(?=\n\s*\d+\s*[\.\)]|$)/gis,
    
    // JSON-like pattern
    /["']?(?:front|question)["']?\s*[=:]\s*["'](.+?)["'][\s,]+["']?(?:back|answer)["']?\s*[=:]\s*["'](.+?)["']/gi
  ];
  
  let cards: Array<{front: string; back: string; category?: string}> = [];
  
  // Try each pattern
  for (const pattern of explicitPatterns) {
    let match;
    while ((match = pattern.exec(cleanText)) !== null) {
      if (match[1] && match[2] && 
          match[1].trim().length > 0 && 
          match[2].trim().length > 0) {
        cards.push({
          front: match[1].trim(),
          back: match[2].trim(),
          category: 'AI Generated'
        });
      }
    }
    
    // If we found cards with this pattern, stop looking
    if (cards.length > 0) break;
  }
  
  // If no matches with explicit patterns, try code blocks for JSON
  if (cards.length === 0) {
    const jsonBlocks = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        try {
          const jsonContent = block.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
          const parsedCards = JSON.parse(jsonContent);
          
          if (Array.isArray(parsedCards)) {
            // Filter out cards that don't have both front and back
            const validCards = parsedCards.filter(card => 
              card && 
              typeof card === 'object' && 
              ((card.front && card.back) || (card.question && card.answer))
            );
            
            cards = validCards.map(card => ({
              front: (card.front || card.question || '').trim(),
              back: (card.back || card.answer || '').trim(),
              category: (card.category || 'AI Generated').trim()
            }));
            
            if (cards.length > 0) break;
          }
        } catch (e) {
          // Continue to next block if this one doesn't parse
          console.error('Error parsing JSON block:', e);
        }
      }
    }
  }
  
  // Last resort: try to analyze paragraph structure
  if (cards.length === 0) {
    const paragraphs = cleanText
      .split(/\n{2,}/)
      .filter(p => p.trim().length > 0 && p.trim().length < 500);
    
    for (let i = 0; i < paragraphs.length - 1; i += 2) {
      // Check if this might be a question-answer pair
      if (paragraphs[i] && paragraphs[i+1] && 
          paragraphs[i].length < 250 && paragraphs[i+1].length < 500 &&
          !paragraphs[i].includes('```') && !paragraphs[i+1].includes('```')) {
        
        // Look for question-like endings
        const isQuestion = paragraphs[i].trim().endsWith('?') || 
                        /what|how|why|when|define|explain|describe/i.test(paragraphs[i]);
        
        if (isQuestion) {
          cards.push({
            front: paragraphs[i].trim(),
            back: paragraphs[i+1].trim(),
            category: 'AI Generated'
          });
        }
      }
    }
  }
  
  // Filter out cards with very short content
  return cards.filter(card => 
    card.front.length > 3 && 
    card.back.length > 3 && 
    // Filter out cards with repetitive content
    card.front.toLowerCase() !== card.back.toLowerCase()
  );
};
