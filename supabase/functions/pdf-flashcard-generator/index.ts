
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { pdfContent } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!pdfContent || (Array.isArray(pdfContent) && pdfContent.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'No PDF content provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log("Received PDF content for processing, content length:", 
      Array.isArray(pdfContent) ? pdfContent.length : pdfContent.length);

    // Format content for the AI
    const contentForAI = Array.isArray(pdfContent) 
      ? pdfContent.join("\n\n")
      : pdfContent;

    const prompt = `
      You are an expert educator who creates high-quality flashcards.
      Analyze the following PDF content and create educational flashcards.
      
      For each important concept, create a flashcard with:
      - A clear question on the front (prefixed with "Q:")
      - A concise answer on the back (prefixed with "A:")
      - A category label (prefixed with "Category:")
      
      Focus on key concepts, definitions, and important facts.
      Make questions specific enough to test knowledge but not overly complex.
      Organize similar concepts together under the same category.
      Format your response as a series of flashcards, each with Q:, A:, and Category: clearly marked.
      
      PDF Content:
      ${contentForAI.substring(0, 4000)} // Limit to first 4000 chars to avoid token limits
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert educator who creates high-quality flashcards for effective learning.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the response to extract flashcards
    let flashcards = [];
    const flashcardPattern = /Q:(.*?)\nA:(.*?)(?:\nCategory:(.*?))?(?=\n\nQ:|$)/gs;
    let match;

    while ((match = flashcardPattern.exec(aiResponse)) !== null) {
      const front = match[1]?.trim();
      const back = match[2]?.trim();
      const category = match[3]?.trim() || 'AI Generated';

      if (front && back) {
        flashcards.push({
          front,
          back,
          category,
          difficulty: 'medium'
        });
      }
    }

    // If pattern matching failed, return the raw AI response
    if (flashcards.length === 0) {
      return new Response(
        JSON.stringify({ 
          flashcards: [], 
          rawResponse: aiResponse,
          error: "Failed to parse flashcards from AI response" 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated ${flashcards.length} flashcards from PDF content`);

    return new Response(
      JSON.stringify({ flashcards }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pdf-flashcard-generator function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
