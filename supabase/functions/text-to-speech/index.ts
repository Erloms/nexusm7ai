
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 支持的语音列表
const SUPPORTED_VOICES = {
  // OpenAI 官方语音
  'alloy': { provider: 'openai' },
  'echo': { provider: 'openai' },
  'fable': { provider: 'openai' },
  'onyx': { provider: 'openai' },
  'nova': { provider: 'openai' },
  'shimmer': { provider: 'openai' },
  // Pollinations.ai 扩展语音
  'coral': { provider: 'pollinations' },
  'verse': { provider: 'pollinations' },
  'ballad': { provider: 'pollinations' },
  'ash': { provider: 'pollinations' },
  'sage': { provider: 'pollinations' },
  'brook': { provider: 'pollinations' },
  'clover': { provider: 'pollinations' },
  'dan': { provider: 'pollinations' },
  'elan': { provider: 'pollinations' },
  'aurora': { provider: 'pollinations' },
  'phoenix': { provider: 'pollinations' },
  'luna': { provider: 'pollinations' }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating speech with voice:', voice, 'text length:', text.length)

    const voiceConfig = SUPPORTED_VOICES[voice as keyof typeof SUPPORTED_VOICES]
    if (!voiceConfig) {
      throw new Error(`Unsupported voice: ${voice}`)
    }

    let audioContent: ArrayBuffer

    if (voiceConfig.provider === 'openai') {
      // 使用 OpenAI TTS API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiApiKey) {
        console.error('OpenAI API key not found, falling back to pollinations')
        // 如果没有 OpenAI key，fallback 到 pollinations
        audioContent = await generateWithPollinations(text, voice)
      } else {
        try {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1',
              input: text,
              voice: voice,
              response_format: 'mp3',
            }),
          })

          if (!response.ok) {
            console.error('OpenAI API error:', response.status, await response.text())
            // Fallback to pollinations
            audioContent = await generateWithPollinations(text, voice)
          } else {
            audioContent = await response.arrayBuffer()
          }
        } catch (error) {
          console.error('OpenAI request failed:', error)
          // Fallback to pollinations
          audioContent = await generateWithPollinations(text, voice)
        }
      }
    } else {
      // 使用 Pollinations.ai TTS API
      audioContent = await generateWithPollinations(text, voice)
    }

    // Convert audio buffer to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioContent))
    )

    console.log('Audio generated successfully, size:', audioContent.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('TTS Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function generateWithPollinations(text: string, voice: string): Promise<ArrayBuffer> {
  // 使用 pollinations.ai 的 TTS API
  const encodedText = encodeURIComponent(text)
  const url = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`
  
  console.log('Calling pollinations API:', url)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TTS-Bot/1.0)',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Pollinations API error:', response.status, errorText)
    throw new Error(`Pollinations API error: ${response.status} ${errorText}`)
  }

  return await response.arrayBuffer()
}
