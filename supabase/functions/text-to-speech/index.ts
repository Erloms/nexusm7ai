
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

    // 直接使用 Pollinations.ai 的GET方式，这个更稳定
    console.log('Using Pollinations.ai TTS with GET method')
    
    // 限制文本长度以适应API限制
    const limitedText = text.substring(0, 1000)
    
    try {
      // 使用GET方式调用Pollinations.ai TTS
      const ttsUrl = `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${voice}`
      
      console.log('Calling Pollinations TTS URL:', ttsUrl.substring(0, 100) + '...')
      
      const response = await fetch(ttsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'audio/*,*/*;q=0.9',
        },
      })

      console.log('Pollinations response status:', response.status)
      console.log('Pollinations response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        audioContent = await response.arrayBuffer()
        console.log('Pollinations TTS successful, size:', audioContent.byteLength)
        
        // 验证音频内容
        if (audioContent.byteLength < 100) {
          throw new Error('Generated audio is too small, likely invalid')
        }
        
        // 检查是否是有效的音频格式（简单检查）
        const audioBytes = new Uint8Array(audioContent.slice(0, 4))
        const isValidAudio = (
          // MP3 header
          (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0) ||
          // WAV header
          (audioBytes[0] === 0x52 && audioBytes[1] === 0x49 && audioBytes[2] === 0x46 && audioBytes[3] === 0x46) ||
          // OGG header
          (audioBytes[0] === 0x4F && audioBytes[1] === 0x67 && audioBytes[2] === 0x67 && audioBytes[3] === 0x53)
        )
        
        if (!isValidAudio) {
          // 如果不是有效音频，尝试将响应作为文本读取看看是什么内容
          const textContent = new TextDecoder().decode(audioContent.slice(0, 200))
          console.log('Response content (first 200 chars):', textContent)
          throw new Error('Response is not valid audio format')
        }

      } else {
        const errorText = await response.text()
        console.error('Pollinations API error:', response.status, errorText)
        throw new Error(`Pollinations API error: ${response.status} - ${errorText}`)
      }

    } catch (error) {
      console.error('Pollinations TTS error:', error)
      
      // 备用方案：使用简单的TTS服务
      console.log('Trying fallback TTS service')
      try {
        const fallbackResponse = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(limitedText)}`, {
          method: 'GET'
        })

        if (fallbackResponse.ok) {
          audioContent = await fallbackResponse.arrayBuffer()
          console.log('Fallback TTS successful, size:', audioContent.byteLength)
          
          if (audioContent.byteLength < 100) {
            throw new Error('Fallback TTS generated invalid audio')
          }
        } else {
          throw new Error('Fallback TTS also failed')
        }
      } catch (fallbackError) {
        console.error('Fallback TTS error:', fallbackError)
        throw new Error('All TTS services failed. Please try again with shorter text.')
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
