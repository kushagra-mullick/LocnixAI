
export const processWithGemini = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  try {
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `HTTP error! Status: ${response.status}` } }));
      console.error('Gemini API error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || `HTTP error! Status: ${response.status}`}`);
    }
    
    const data = await response.json();
    let content;
    
    // Handle different response formats from Gemini
    if (data.candidates && data.candidates[0]?.content?.parts) {
      content = data.candidates[0].content.parts[0]?.text || '';
    } else if (data.text) {
      content = data.text;
    } else {
      console.error('Unexpected Gemini response structure:', data);
      throw new Error('Unexpected response format from Gemini API');
    }
    
    if (!content) {
      throw new Error("Empty response from Gemini");
    }
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Try to extract from markdown code blocks
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
        let codeMatch;
        while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
          try {
            const jsonData = JSON.parse(codeMatch[1].trim());
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              flashcards = jsonData;
              break;
            }
          } catch (e) {
            // Try next match if this one doesn't parse
          }
        }
        
        // If still no results, try line-by-line parsing
        if (flashcards.length === 0) {
          const lines = content.split('\n');
          let currentCard: Record<string, string> = {};
          
          for (const line of lines) {
            if (line.includes('front') || line.includes('question')) {
              if (Object.keys(currentCard).length > 0) {
                flashcards.push({...currentCard});
                currentCard = {};
              }
              const questionMatch = line.match(/["']?(?:front|question)["']?\s*[=:]\s*["'](.+?)["']/i);
              if (questionMatch) {
                currentCard.front = questionMatch[1];
              }
            } else if (line.includes('back') || line.includes('answer')) {
              const answerMatch = line.match(/["']?(?:back|answer)["']?\s*[=:]\s*["'](.+?)["']/i);
              if (answerMatch) {
                currentCard.back = answerMatch[1];
              }
            } else if (line.includes('category')) {
              const categoryMatch = line.match(/["']?category["']?\s*[=:]\s*["'](.+?)["']/i);
              if (categoryMatch) {
                currentCard.category = categoryMatch[1];
              } else {
                currentCard.category = "PDF Extract";
              }
            }
          }
          
          // Add the last card if it has both front and back
          if (currentCard.front && currentCard.back) {
            if (!currentCard.category) currentCard.category = "PDF Extract";
            flashcards.push(currentCard);
          }
        }
      }
      
      // Add IDs and default category if missing
      return flashcards.map((card: any, index: number) => ({
        ...card,
        id: `card-${Date.now()}-${index}`,
        category: card.category || "PDF Extract"
      }));
    } catch (parseError) {
      console.error('Error parsing flashcard JSON from Gemini:', parseError, 'Content:', content);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw error;
  }
};
