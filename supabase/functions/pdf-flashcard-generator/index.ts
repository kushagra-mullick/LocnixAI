
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define types for API responses
interface FlashcardData {
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Define a type for the request body
interface RequestBody {
  pdfContent: string[];
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OPENAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    // Parse the request body
    const { pdfContent } = await req.json() as RequestBody;
    
    if (!pdfContent || !Array.isArray(pdfContent) || pdfContent.length === 0) {
      throw new Error('Invalid or empty PDF content provided');
    }

    // Limit the content to process to avoid token limits
    const limitedContent = pdfContent.slice(0, Math.min(pdfContent.length, 25));
    
    console.log(`Processing ${limitedContent.length} PDF content segments`);

    // Generate flashcards using OpenAI
    const flashcards = await generateFlashcardsWithAI(limitedContent, openaiApiKey);
    
    console.log(`Generated ${flashcards.length} flashcards successfully`);

    // Return the generated flashcards
    return new Response(
      JSON.stringify({ 
        flashcards,
        processed: limitedContent.length,
        total: pdfContent.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in PDF flashcard generator:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate flashcards',
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function generateFlashcardsWithAI(contentSegments: string[], apiKey: string): Promise<FlashcardData[]> {
  const combinedContent = contentSegments.join('\n\n').substring(0, 6000);
  
  // Create the prompt for OpenAI
  const prompt = `
  You are an intelligent tool for creating effective flashcards from educational content.
  Convert the following text extracted from a PDF into ${Math.min(contentSegments.length, 15)} high-quality flashcards.
  
  Each flashcard should have:
  1. Front: A clear, concise question or prompt
  2. Back: A comprehensive but focused answer
  3. Category: A fitting category for the content (e.g., "Biology", "History", etc.)
  4. Difficulty: Either "easy", "medium", or "hard" based on the complexity
  
  For best learning results:
  - Create questions that test understanding, not just recall
  - Focus on key concepts and important details
  - Phrase questions clearly and unambiguously
  - Ensure answers are concise but complete
  
  The content to process is:
  ${combinedContent}
  
  Format your response as JSON with this structure:
  [
    {
      "front": "Question/prompt here?",
      "back": "Answer here",
      "category": "Category name",
      "difficulty": "medium"
    },
    ...more flashcards
  ]
  
  Only return the JSON array with no additional text.
  `;

  // Call OpenAI API
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI assistant that creates educational flashcards from text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    // Extract JSON from response (handle case where AI might add extra text)
    let jsonStr = aiResponse;
    if (aiResponse.includes('[') && aiResponse.includes(']')) {
      jsonStr = aiResponse.substring(
        aiResponse.indexOf('['),
        aiResponse.lastIndexOf(']') + 1
      );
    }
    
    // Parse the JSON response
    const flashcards = JSON.parse(jsonStr) as FlashcardData[];
    
    // Ensure the flashcards have the correct structure
    return flashcards.map(card => ({
      front: card.front || "What is this concept about?",
      back: card.back || "Information not provided",
      category: card.category || "PDF Extract",
      difficulty: card.difficulty || "medium"
    }));
  } catch (error) {
    console.error('Error generating flashcards with AI:', error);
    // Return a simple fallback in case of API errors
    return contentSegments.slice(0, 5).map((content, index) => ({
      front: `What is the key concept in extract ${index + 1}?`,
      back: content,
      category: "PDF Extract",
      difficulty: "medium" as const
    }));
  }
}
