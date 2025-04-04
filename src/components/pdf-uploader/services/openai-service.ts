
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
