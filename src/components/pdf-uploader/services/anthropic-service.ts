
export const processWithAnthropic = async (
  apiKey: string,
  model: string,
  extractedText: string
) => {
  try {
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `HTTP error! Status: ${response.status}` } }));
      console.error('Anthropic API error:', errorData);
      throw new Error(`API Error: ${errorData.error?.message || `HTTP error! Status: ${response.status}`}`);
    }
    
    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error("Empty response from Anthropic");
    }
    
    // Try to parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let flashcards = [];
      
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Try alternate parsing approach for Claude-style responses
        const sections = content.split(/\n\n|\r\n\r\n/);
        for (const section of sections) {
          if (section.includes('[{') || section.includes('[\n{')) {
            try {
              const jsonStr = section.trim();
              const parsed = JSON.parse(jsonStr);
              if (Array.isArray(parsed) && parsed.length > 0) {
                flashcards = parsed;
                break;
              }
            } catch (e) {
              // Continue to next section if this one doesn't parse
            }
          }
        }
        
        // If still no results, try to extract structured content
        if (flashcards.length === 0) {
          const cardRegex = /(\d+)\.\s*(?:Q:|Question:)?\s*(.+?)\s*(?:A:|Answer:)?\s*(.+?)(?=\d+\.\s*|$)/g;
          let match;
          while ((match = cardRegex.exec(content)) !== null) {
            const [_, num, question, answer] = match;
            if (question && answer) {
              flashcards.push({
                front: question.trim(),
                back: answer.trim(),
                category: "PDF Extract"
              });
            }
          }
        }
      }
      
      // Add IDs to flashcards
      return flashcards.map((card, index) => ({
        ...card,
        id: `card-${Date.now()}-${index}`
      }));
    } catch (parseError) {
      console.error('Error parsing flashcard JSON from Anthropic:', parseError, 'Content:', content);
      throw new Error("Failed to create flashcards. The AI response format was unexpected.");
    }
  } catch (error) {
    console.error('Anthropic processing error:', error);
    throw error;
  }
};

