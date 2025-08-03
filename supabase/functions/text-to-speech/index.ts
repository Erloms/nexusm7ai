
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

    // 限制文本长度，避免 URL 过长
    if (text.length > 2000) {
      throw new Error('Text too long. Please limit to 2000 characters.')
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
        console.log('OpenAI API key not found, trying pollinations fallback')
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
            const errorText = await response.text()
            console.error('OpenAI API error:', response.status, errorText)
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          audioContent = await response.arrayBuffer()
          console.log('OpenAI audio generated successfully, size:', audioContent.byteLength)
        } catch (error) {
          console.error('OpenAI request failed:', error)
          console.log('Falling back to pollinations')
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

    console.log('Audio generated successfully, final size:', audioContent.byteLength)

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
  console.log('Using pollinations API for voice:', voice)
  
  // 对于长文本，使用 POST 方法避免 URL 长度限制
  if (text.length > 1000) {
    console.log('Text is long, using POST method')
    
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TTS-Bot/1.0)',
        },
        body: JSON.stringify({
          text: text,
          model: 'openai-audio',
          voice: voice
        })
      })

      if (!response.ok) {
        throw new Error(`POST request failed: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.log('POST method failed, trying GET with truncated text:', error)
      // 如果 POST 失败，截断文本使用 GET
      const truncatedText = text.substring(0, 800)
      return generateWithPollinationsGet(truncatedText, voice)
    }
  } else {
    // 短文本使用 GET 方法
    return generateWithPollinationsGet(text, voice)
  }
}

async function generateWithPollinationsGet(text: string, voice: string): Promise<ArrayBuffer> {
  // 使用 pollinations.ai 的 TTS API (GET 方法)
  const encodedText = encodeURIComponent(text)
  const url = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`
  
  console.log('Calling pollinations GET API, text length:', text.length)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TTS-Bot/1.0)',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Pollinations GET API error:', response.status, errorText)
    throw new Error(`Pollinations API error: ${response.status}`)
  }

  console.log('Pollinations GET request successful')
  return await response.arrayBuffer()
}
