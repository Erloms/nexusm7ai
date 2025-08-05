
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

// 你提供的 API key
const API_KEY = 'r---77WuReCx4PoE'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json()

    console.log('TTS Request received:', { textLength: text?.length, voice })

    if (!text) {
      console.error('Text is required but not provided')
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
      console.error('Text too long:', text.length)
      return new Response(
        JSON.stringify({ error: 'Text too long. Please limit to 4000 characters.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const voiceConfig = SUPPORTED_VOICES[voice as keyof typeof SUPPORTED_VOICES]
    if (!voiceConfig) {
      console.error('Unsupported voice:', voice)
      return new Response(
        JSON.stringify({ error: `Unsupported voice: ${voice}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Generating speech with voice:', voice, 'provider:', voiceConfig.provider)

    let audioContent: ArrayBuffer

    // 根据语音类型选择不同的API
    if (voiceConfig.provider === 'openai') {
      // 使用你的 API key 调用 OpenAI TTS
      console.log('Using OpenAI TTS API with provided key')
      
      try {
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'User-Agent': 'NexusAI/1.0'
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: voice,
            response_format: 'mp3'
          })
        })

        console.log('OpenAI TTS response status:', response.status)
        
        if (response.ok) {
          audioContent = await response.arrayBuffer()
          console.log('OpenAI TTS successful, size:', audioContent.byteLength)
        } else {
          const errorText = await response.text()
          console.error('OpenAI TTS API error:', response.status, errorText)
          throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.error('OpenAI TTS error:', error)
        throw new Error(`OpenAI TTS failed: ${error.message}`)
      }
    } else {
      // 使用 Pollinations.ai 处理其他语音
      console.log('Using Pollinations.ai TTS API')
      
      // 限制文本长度以适应 Pollinations API
      const limitedText = text.substring(0, 1000)
      
      try {
        // 方法1: 尝试 Pollinations.ai 的 GET 方式（带你的 API key）
        const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${voice}&key=${API_KEY}`
        
        console.log('Calling Pollinations TTS with API key')
        
        const response = await fetch(pollinationsUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'NexusAI/1.0',
            'Accept': 'audio/*,*/*;q=0.9',
            'Referer': 'https://nexusai.app'
          }
        })

        console.log('Pollinations response status:', response.status)
        console.log('Pollinations response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          audioContent = await response.arrayBuffer()
          console.log('Pollinations TTS successful, size:', audioContent.byteLength)
          
          // 验证音频内容
          if (audioContent.byteLength < 100) {
            throw new Error('Generated audio is too small')
          }
          
        } else {
          const errorText = await response.text()
          console.error('Pollinations API error:', response.status, errorText)
          
          // 备用方案: 使用免费的 TTS 服务
          console.log('Trying free TTS fallback')
          const fallbackUrl = `https://api.voicerss.org/?key=demo&hl=en-us&src=${encodeURIComponent(limitedText.substring(0, 500))}&f=22khz_16bit_mono`
          
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET'
          })

          if (fallbackResponse.ok) {
            audioContent = await fallbackResponse.arrayBuffer()
            console.log('Fallback TTS successful, size:', audioContent.byteLength)
          } else {
            throw new Error('All TTS services failed')
          }
        }

      } catch (error) {
        console.error('Pollinations TTS error:', error)
        
        // 最终备用方案：使用你的 API key 调用 OpenAI API，但用默认的 alloy 语音
        console.log('Using OpenAI as final fallback with alloy voice')
        try {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'tts-1',
              input: limitedText,
              voice: 'alloy',
              response_format: 'mp3'
            })
          })

          if (response.ok) {
            audioContent = await response.arrayBuffer()
            console.log('Final fallback successful, size:', audioContent.byteLength)
          } else {
            throw new Error('All TTS services failed including OpenAI fallback')
          }
        } catch (finalError) {
          console.error('Final fallback failed:', finalError)
          throw new Error('All TTS services are currently unavailable. Please try again later.')
        }
      }
    }

    // Convert audio buffer to base64
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioContent))
    )

    console.log('Audio generated successfully, final size:', audioContent.byteLength)

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
