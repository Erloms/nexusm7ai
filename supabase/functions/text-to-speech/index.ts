
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 支持的语音列表
const SUPPORTED_VOICES = {
  // OpenAI 官方语音 - 但我们没有有效的OpenAI API key，所以通过Pollinations.ai调用
  'alloy': { provider: 'pollinations' },
  'echo': { provider: 'pollinations' },
  'fable': { provider: 'pollinations' },
  'onyx': { provider: 'pollinations' },
  'nova': { provider: 'pollinations' },
  'shimmer': { provider: 'pollinations' },
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

// Pollinations.ai API key
const POLLINATIONS_API_KEY = 'r---77WuReCx4PoE'

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

    console.log('Generating speech with voice:', voice, 'using Pollinations.ai')

    let audioContent: ArrayBuffer

    try {
      // 使用 Pollinations.ai TTS API (所有语音都通过这个服务)
      const limitedText = text.substring(0, 1000) // Pollinations限制文本长度
      
      // 方法1: 尝试带API key的POST请求
      console.log('Trying Pollinations TTS with POST and API key')
      
      const postResponse = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${POLLINATIONS_API_KEY}`,
          'User-Agent': 'NexusAI/1.0'
        },
        body: JSON.stringify({
          text: limitedText,
          model: 'openai-audio',
          voice: voice
        })
      })

      console.log('Pollinations POST response status:', postResponse.status)

      if (postResponse.ok) {
        audioContent = await postResponse.arrayBuffer()
        console.log('Pollinations POST TTS successful, size:', audioContent.byteLength)
      } else {
        // 方法2: 尝试GET请求带API key
        console.log('POST failed, trying GET with API key')
        const getUrl = `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${voice}&key=${POLLINATIONS_API_KEY}`
        
        const getResponse = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'NexusAI/1.0',
            'Accept': 'audio/*,*/*;q=0.9'
          }
        })

        console.log('Pollinations GET response status:', getResponse.status)

        if (getResponse.ok) {
          audioContent = await getResponse.arrayBuffer()
          console.log('Pollinations GET TTS successful, size:', audioContent.byteLength)
        } else {
          // 方法3: 尝试不带API key的GET请求
          console.log('GET with key failed, trying GET without key')
          const simpleGetUrl = `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${voice}`
          
          const simpleResponse = await fetch(simpleGetUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'NexusAI/1.0',
              'Accept': 'audio/*,*/*;q=0.9'
            }
          })

          console.log('Pollinations simple GET response status:', simpleResponse.status)

          if (simpleResponse.ok) {
            audioContent = await simpleResponse.arrayBuffer()
            console.log('Pollinations simple GET TTS successful, size:', audioContent.byteLength)
          } else {
            // 最后的备用方案：使用免费TTS服务
            console.log('All Pollinations methods failed, trying fallback TTS')
            const fallbackUrl = `https://api.voicerss.org/?key=demo&hl=en-us&src=${encodeURIComponent(limitedText.substring(0, 500))}&f=22khz_16bit_mono`
            
            const fallbackResponse = await fetch(fallbackUrl)
            if (fallbackResponse.ok) {
              audioContent = await fallbackResponse.arrayBuffer()
              console.log('Fallback TTS successful, size:', audioContent.byteLength)
            } else {
              throw new Error('All TTS services failed')
            }
          }
        }
      }

      // 验证音频内容
      if (audioContent.byteLength < 100) {
        throw new Error('Generated audio is too small, likely not valid audio')
      }

    } catch (error) {
      console.error('TTS generation error:', error)
      throw new Error(`TTS服务暂时不可用: ${error.message}`)
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
