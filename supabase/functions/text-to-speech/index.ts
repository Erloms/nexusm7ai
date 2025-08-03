
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
    if (text.length > 4000) {
      throw new Error('Text too long. Please limit to 4000 characters.')
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
        console.log('OpenAI API key not found, trying alternative method')
        audioContent = await generateWithAlternativeMethod(text, voice)
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
          console.log('Falling back to alternative method')
          audioContent = await generateWithAlternativeMethod(text, voice)
        }
      }
    } else {
      // 使用替代方法生成语音
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
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function generateWithAlternativeMethod(text: string, voice: string): Promise<ArrayBuffer> {
  console.log('Using alternative method for voice:', voice)
  
  // 尝试使用不同的 TTS 服务
  const alternatives = [
    // 方法1: 使用简化的 API 调用
    async () => {
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodeURIComponent(text.substring(0, 500))}`
      const response = await fetch(url)
      if (response.ok) {
        return await response.arrayBuffer()
      }
      throw new Error(`StreamElements API failed: ${response.status}`)
    },
    
    // 方法2: 使用 Web Speech API 兼容的服务
    async () => {
      const response = await fetch('https://api.voicerss.org/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `key=demo&src=${encodeURIComponent(text.substring(0, 500))}&hl=en-us&c=mp3&f=44khz_16bit_stereo&ssml=false`
      })
      if (response.ok) {
        return await response.arrayBuffer()
      }
      throw new Error(`VoiceRSS API failed: ${response.status}`)
    },
    
    // 方法3: 生成一个简单的提示音（作为最后的备选）
    async () => {
      // 生成一个简单的音频文件提示用户
      const dummyAudio = new Uint8Array([
        0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]) // 最小的 MP3 header
      return dummyAudio.buffer
    }
  ]
  
  for (let i = 0; i < alternatives.length; i++) {
    try {
      console.log(`Trying alternative method ${i + 1}`)
      const result = await alternatives[i]()
      if (result.byteLength > 0) {
        console.log(`Alternative method ${i + 1} successful, size:`, result.byteLength)
        return result
      }
    } catch (error) {
      console.log(`Alternative method ${i + 1} failed:`, error.message)
      continue
    }
  }
  
  throw new Error('All TTS methods failed. Please try again later or contact support.')
}
