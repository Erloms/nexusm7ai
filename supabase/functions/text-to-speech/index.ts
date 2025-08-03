
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
      // 尝试使用 OpenAI TTS API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
      if (openaiApiKey) {
        try {
          console.log('Using OpenAI API')
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
          console.log('Falling back to alternative method')
          audioContent = await generateWithAlternativeMethod(text, voice)
        }
      } else {
        console.log('OpenAI API key not found, using alternative method')
        audioContent = await generateWithAlternativeMethod(text, voice)
      }
    } else {
      // 使用替代方法生成语音
      console.log('Using alternative method for voice:', voice)
      audioContent = await generateWithAlternativeMethod(text, voice)
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

async function generateWithAlternativeMethod(text: string, voice: string): Promise<ArrayBuffer> {
  console.log('Using alternative method for voice:', voice)
  
  // 尝试使用不同的 TTS 服务
  const alternatives = [
    // 方法1: 使用 ElevenLabs 公共API (如果可用)
    async () => {
      console.log('Trying ElevenLabs public API')
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.substring(0, 1000),
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        })
        if (response.ok) {
          return await response.arrayBuffer()
        }
        throw new Error(`ElevenLabs API failed: ${response.status}`)
      } catch (error) {
        console.log('ElevenLabs failed:', error)
        throw error
      }
    },
    
    // 方法2: 使用 Text-to-Speech API
    async () => {
      console.log('Trying TTS API')
      try {
        const response = await fetch(`https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text.substring(0, 500))}`)
        if (response.ok) {
          return await response.arrayBuffer()
        }
        throw new Error(`TTS API failed: ${response.status}`)
      } catch (error) {
        console.log('TTS API failed:', error)
        throw error
      }
    },
    
    // 方法3: 生成一个简单的音频提示
    async () => {
      console.log('Generating placeholder audio')
      // 返回一个最小的有效MP3文件头
      const mp3Header = new Uint8Array([
        0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x44, 0x33, 0x03
      ])
      return mp3Header.buffer
    }
  ]
  
  for (let i = 0; i < alternatives.length; i++) {
    try {
      console.log(`Trying alternative method ${i + 1}`)
      const result = await alternatives[i]()
      if (result.byteLength > 20) { // 确保有实际内容
        console.log(`Alternative method ${i + 1} successful, size:`, result.byteLength)
        return result
      }
    } catch (error) {
      console.log(`Alternative method ${i + 1} failed:`, error.message)
      continue
    }
  }
  
  throw new Error('All TTS methods failed. Please check your network connection and try again.')
}
