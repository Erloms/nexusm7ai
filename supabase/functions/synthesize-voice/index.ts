
// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice, readingMode } = await req.json()

    if (!text || !voice) {
      return new Response(
        JSON.stringify({ error: 'Text and voice are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Limit text length to prevent API issues
    const limitedText = text.substring(0, 800);
    
    let audioGenerationPrompt = limitedText;
    if (readingMode === 'strict') {
      audioGenerationPrompt = `请严格地、不加任何修改地朗读以下文本：${limitedText}`;
    }

    // Try multiple API endpoints for better reliability
    const apiUrls = [
      `https://text.pollinations.ai/${encodeURIComponent(audioGenerationPrompt)}?voice=${voice}`,
      `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?voice=${voice}&model=openai-audio`,
    ];

    let lastError;
    for (const audioUrl of apiUrls) {
      try {
        const response = await fetch(audioUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NexusAI/1.0)',
            'Accept': 'audio/mpeg, audio/wav, audio/*',
          }
        });

        if (response.ok) {
          const audioContent = await response.arrayBuffer();
          if (audioContent.byteLength > 100) {
            // Convert to base64 for consistent handling
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioContent)));
            
            return new Response(
              JSON.stringify({ audioContent: base64Audio }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
        }
        lastError = `API returned ${response.status}: ${await response.text()}`;
      } catch (error) {
        lastError = error.message;
        continue;
      }
    }

    throw new Error(lastError || 'All API endpoints failed');

  } catch (error) {
    console.error('Voice synthesis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
