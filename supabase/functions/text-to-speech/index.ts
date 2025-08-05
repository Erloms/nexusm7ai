

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

    if (voiceConfig.provider === 'openai') {
      // 使用您提供的API key尝试 OpenAI TTS API
      const apiKey = 'r---77WuReCx4PoE' // 使用您提供的API key
      try {
        console.log('Using OpenAI API with provided key')
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
        }

        audioContent = await response.arrayBuffer()
        console.log('OpenAI audio generated successfully, size:', audioContent.byteLength)
      } catch (error) {
        console.error('OpenAI request failed:', error)
        console.log('Falling back to Pollinations.ai')
        audioContent = await generateWithPollinations(text, voice)
      }
    } else {
      // 使用 Pollinations.ai 生成语音
      console.log('Using Pollinations.ai for voice:', voice)
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
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function generateWithPollinations(text: string, voice: string): Promise<ArrayBuffer> {
  console.log('Using Pollinations.ai for TTS generation')
  
  try {
    // 使用您提供的API key
    const apiKey = 'r---77WuReCx4PoE'
    
    // 限制文本长度以适应API限制
    const limitedText = text.substring(0, 1000)
    
    // 尝试使用 Pollinations.ai TTS API
    const response = await fetch('https://text.pollinations.ai/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: limitedText,
        voice: voice,
        speed: 1.0,
        format: 'mp3'
      }),
    })

    if (response.ok) {
      const audioBuffer = await response.arrayBuffer()
      if (audioBuffer.byteLength > 100) { // 确保有实际内容
        console.log('Pollinations.ai TTS successful, size:', audioBuffer.byteLength)
        return audioBuffer
      }
    }

    console.log('Pollinations.ai TTS failed, trying alternative URL')
    
    // 备用方法：使用URL参数方式
    const urlResponse = await fetch(`https://text.pollinations.ai/tts?text=${encodeURIComponent(limitedText)}&voice=${voice}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (urlResponse.ok) {
      const audioBuffer = await urlResponse.arrayBuffer()
      if (audioBuffer.byteLength > 100) {
        console.log('Pollinations.ai URL method successful, size:', audioBuffer.byteLength)
        return audioBuffer
      }
    }

    // 最后的备用方法
    console.log('Trying fallback TTS service')
    const fallbackResponse = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(limitedText)}`, {
      method: 'GET'
    })

    if (fallbackResponse.ok) {
      const audioBuffer = await fallbackResponse.arrayBuffer()
      if (audioBuffer.byteLength > 100) {
        console.log('Fallback TTS successful, size:', audioBuffer.byteLength)
        return audioBuffer
      }
    }

    throw new Error('All TTS methods failed to generate valid audio')
    
  } catch (error) {
    console.error('Pollinations TTS error:', error)
    throw new Error('TTS generation failed. Please try again with shorter text.')
  }
}

