
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 支持的语音列表 - 使用Pollinations.ai服务
const SUPPORTED_VOICES = {
  // OpenAI 兼容语音
  'alloy': 'alloy',
  'echo': 'echo', 
  'fable': 'fable',
  'onyx': 'onyx',
  'nova': 'nova',
  'shimmer': 'shimmer',
  // Pollinations.ai 扩展语音
  'coral': 'coral',
  'verse': 'verse',
  'ballad': 'ballad',
  'ash': 'ash',
  'sage': 'sage',
  'brook': 'brook',
  'clover': 'clover',
  'dan': 'dan',
  'elan': 'elan',
  'aurora': 'aurora',
  'phoenix': 'phoenix',
  'luna': 'luna'
}

// Pollinations.ai API key
const POLLINATIONS_API_KEY = 'r---77WuReCx4PoE'

serve(async (req) => {
  console.log('TTS Function called, method:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json()

    console.log('TTS Request:', { textLength: text?.length, voice })

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 限制文本长度
    if (text.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Please limit to 4000 characters.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const voiceName = SUPPORTED_VOICES[voice as keyof typeof SUPPORTED_VOICES]
    if (!voiceName) {
      return new Response(
        JSON.stringify({ error: `Unsupported voice: ${voice}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Using voice:', voiceName)

    let audioContent: ArrayBuffer

    try {
      // 限制文本长度到1000字符以内
      const limitedText = text.substring(0, 1000)
      
      console.log('Calling Pollinations.ai TTS API')
      
      // 使用Pollinations.ai的TTS服务
      const encodedText = encodeURIComponent(limitedText)
      const ttsUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voiceName}`
      
      console.log('TTS URL:', ttsUrl)
      
      const response = await fetch(ttsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'NexusAI/1.0',
          'Accept': 'audio/*,*/*;q=0.9'
        }
      })

      console.log('Pollinations response status:', response.status)
      console.log('Pollinations response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`Pollinations API returned ${response.status}: ${response.statusText}`)
      }

      audioContent = await response.arrayBuffer()
      console.log('Audio content size:', audioContent.byteLength)

      // 检查音频内容是否有效
      if (audioContent.byteLength < 100) {
        throw new Error('Generated audio is too small, likely not valid')
      }

    } catch (error) {
      console.error('TTS generation error:', error)
      return new Response(
        JSON.stringify({ error: `TTS service unavailable: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Convert audio buffer to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioContent))
    )

    console.log('TTS generation successful, audio size:', audioContent.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('TTS Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
