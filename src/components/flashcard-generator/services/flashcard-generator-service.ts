
import { API_CONFIGURATION } from '../../pdf-uploader/services/api-config';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  category: string;
}

// Function to generate flashcards with OpenAI API
export const generateWithOpenAI = async (
  text: string, 
  model: string
): Promise<FlashcardData[]> => {
  // Get the API key from central configuration
  const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
  
  const prompt = `
    Create flashcards from the following text. 
    For each important concept or fact, create a flashcard with a question on the front and answer on the back.
    Return in this JSON format:
    [{"front": "...", "back": "...", "category": "..."}]
    Categories should be one of: Concept, Definition, Process, Example, Fact
    Text: ${text}
  `;
  
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
          role: 'system',
          content: 'You are an expert educator who creates high-quality flashcards for effective learning.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = `API request failed with status ${response.status}`;
    
    if (response.status === 429) {
      errorMessage = "API rate limit exceeded. Please try with a different API key or use the simulated mode.";
    } else if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse the response to get flashcards
  let flashcards;
  try {
    // Find JSON in the response (in case the AI wrapped it in text)
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      flashcards = JSON.parse(jsonMatch[0]);
    } else {
      flashcards = JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response");
  }
  
  // Add IDs to the flashcards
  return flashcards.map((card: any, index: number) => ({
    ...card,
    id: `card-${Date.now()}-${index}`
  }));
};

// Function to generate flashcards with Anthropic API
export const generateWithAnthropic = async (
  text: string, 
  model: string
): Promise<FlashcardData[]> => {
  // Get the API key from central configuration
  const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
  
  const prompt = `
    Create flashcards from the following text. 
    For each important concept or fact, create a flashcard with a question on the front and answer on the back.
    Return ONLY a JSON array with this format:
    [{"front": "...", "back": "...", "category": "..."}]
    Categories should be one of: Concept, Definition, Process, Example, Fact.
    Do not include any explanation or other text outside the JSON array.
    
    Text to create flashcards from:
    ${text}
  `;
  
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
      system: "You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON.",
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = `API request failed with status ${response.status}`;
    
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.content[0].text;
  
  // Parse the response to get flashcards
  let flashcards;
  try {
    // Find JSON in the response (in case the AI wrapped it in text)
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      flashcards = JSON.parse(jsonMatch[0]);
    } else {
      flashcards = JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response");
  }
  
  // Add IDs to the flashcards
  return flashcards.map((card: any, index: number) => ({
    ...card,
    id: `card-${Date.now()}-${index}`
  }));
};

// Function to generate flashcards with Perplexity API
export const generateWithPerplexity = async (
  text: string, 
  model: string
): Promise<FlashcardData[]> => {
  // Get the API key from central configuration
  const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
  
  const prompt = `
    Create flashcards from the following text. 
    For each important concept or fact, create a flashcard with a question on the front and answer on the back.
    Return ONLY a JSON array with this format:
    [{"front": "...", "back": "...", "category": "..."}]
    Categories should be one of: Concept, Definition, Process, Example, Fact.
    Do not include any explanation or other text outside the JSON array.
    
    Text to create flashcards from:
    ${text}
  `;
  
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
          role: 'system',
          content: 'You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = `API request failed with status ${response.status}`;
    
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse the response to get flashcards
  let flashcards;
  try {
    // Find JSON in the response (in case the AI wrapped it in text)
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      flashcards = JSON.parse(jsonMatch[0]);
    } else {
      flashcards = JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response");
  }
  
  // Add IDs to the flashcards
  return flashcards.map((card: any, index: number) => ({
    ...card,
    id: `card-${Date.now()}-${index}`
  }));
};

// Function to generate flashcards with Google Gemini API
export const generateWithGemini = async (
  text: string, 
  model: string
): Promise<FlashcardData[]> => {
  // Get the API key from central configuration
  const apiKey = API_CONFIGURATION.OPENAI_API_KEY;
  
  const prompt = `
    Create flashcards from the following text. 
    For each important concept or fact, create a flashcard with a question on the front and answer on the back.
    Return ONLY a JSON array with this format:
    [{"front": "...", "back": "...", "category": "..."}]
    Categories should be one of: Concept, Definition, Process, Example, Fact.
    Do not include any explanation or other text outside the JSON array.
    
    Text to create flashcards from:
    ${text}
  `;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "You are an expert educator who creates high-quality flashcards for effective learning. Always respond with properly formatted JSON."
            }
          ]
        },
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = `API request failed with status ${response.status}`;
    
    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;
  
  // Parse the response to get flashcards
  let flashcards;
  try {
    // Find JSON in the response (in case the AI wrapped it in text)
    const jsonMatch = content.match(/\[.*\]/s);
    if (jsonMatch) {
      flashcards = JSON.parse(jsonMatch[0]);
    } else {
      flashcards = JSON.parse(content);
    }
  } catch (error) {
    console.error("Failed to parse AI response:", content);
    throw new Error("Failed to parse AI response");
  }
  
  // Add IDs to the flashcards
  return flashcards.map((card: any, index: number) => ({
    ...card,
    id: `card-${Date.now()}-${index}`
  }));
};
