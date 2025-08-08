
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 支持的语音列表
const SUPPORTED_VOICES = {
  // OpenAI 原生语音
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
    if (text.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Text too long. Please limit to 2000 characters.' }),
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
      // 限制文本长度到800字符以内
      const limitedText = text.substring(0, 800)
      
      console.log('Calling Pollinations.ai TTS API')
      
      // 尝试多种不同的API调用方式
      const apiUrls = [
        // 方式1: 使用新的API格式，不带token
        `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?voice=${voiceName}`,
        
        // 方式2: 使用原始格式
        `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${voiceName}`,
        
        // 方式3: 使用不同的端点
        `https://audio.pollinations.ai/tts?text=${encodeURIComponent(limitedText)}&voice=${voiceName}`,
      ]
      
      let success = false
      
      for (const [index, ttsUrl] of apiUrls.entries()) {
        console.log(`Trying API approach ${index + 1}:`, ttsUrl)
        
        try {
          const response = await fetch(ttsUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NexusAI/1.0)',
              'Accept': 'audio/mpeg, audio/wav, audio/mp3, audio/*',
              'Referer': 'https://pollinations.ai',
            }
          })

          console.log(`API approach ${index + 1} response status:`, response.status)
          console.log(`API approach ${index + 1} response headers:`, Object.fromEntries(response.headers.entries()))

          if (response.ok) {
            audioContent = await response.arrayBuffer()
            console.log('Audio content size:', audioContent.byteLength)
            
            // 检查音频内容是否有效
            if (audioContent.byteLength > 100) {
              success = true
              break
            } else {
              console.log(`API approach ${index + 1}: Audio too small, trying next approach`)
              continue
            }
          } else if (response.status !== 402 && response.status !== 429) {
            // 如果不是付费或频率限制错误，尝试下一个方法
            const errorText = await response.text()
            console.log(`API approach ${index + 1} error:`, errorText)
            continue
          } else {
            console.log(`API approach ${index + 1}: Got ${response.status}, trying next approach`)
            continue
          }
        } catch (error) {
          console.error(`API approach ${index + 1} failed:`, error)
          continue
        }
      }
      
      if (!success) {
        // 如果所有方法都失败，尝试使用简化的文本
        console.log('All API approaches failed, trying with simplified text')
        
        const simplifiedText = limitedText
          .replace(/[^\u4e00-\u9fa5\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200) // 进一步缩短文本
        
        if (simplifiedText) {
          const fallbackUrl = `https://text.pollinations.ai/${encodeURIComponent(simplifiedText)}?voice=alloy`
          console.log('Trying fallback with simplified text:', fallbackUrl)
          
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; NexusAI/1.0)',
              'Accept': 'audio/*',
            }
          })
          
          if (fallbackResponse.ok) {
            audioContent = await fallbackResponse.arrayBuffer()
            if (audioContent.byteLength > 100) {
              success = true
              console.log('Fallback method succeeded')
            }
          }
        }
      }
      
      if (!success) {
        throw new Error('All TTS API methods failed. The service may be temporarily unavailable.')
      }

    } catch (error) {
      console.error('TTS generation error:', error)
      return new Response(
        JSON.stringify({ 
          error: `TTS service unavailable: ${error.message}` 
        }),
        {
          status: 503,
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
