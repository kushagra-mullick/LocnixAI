
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
    const { message, flashcards } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Prepare context about the flashcards for the AI
    let flashcardsContext = "";
    if (flashcards && flashcards.length > 0) {
      flashcardsContext = "Here are the flashcards in the user's collection:\n\n";
      flashcards.forEach((card: any, index: number) => {
        flashcardsContext += `Card ${index + 1}:\n`;
        flashcardsContext += `- Front (Question): ${card.front}\n`;
        flashcardsContext += `- Back (Answer): ${card.back}\n`;
        if (card.category) flashcardsContext += `- Category: ${card.category}\n`;
        flashcardsContext += "\n";
      });
    } else {
      flashcardsContext = "The user doesn't have any flashcards in their collection yet.";
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a helpful flashcard assistant that helps users with their flashcards. 
            Your job is to answer questions about flashcards, suggest study strategies, explain concepts from the flashcards, 
            create new flashcards based on existing ones, and generally help the user learn more effectively.
            
            ${flashcardsContext}`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in flashcard-ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
