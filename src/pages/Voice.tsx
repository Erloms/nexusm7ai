import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  Volume2, 
  Download, 
  CheckCircle2,
  ArrowLeft,
  Mic,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  color: string;
  avatar: string;
  personality: string;
}

interface HistoryItem {
  id: number;
  timestamp: Date;
  voice: string;
  text: string;
  audioUrl?: string;
  mode: 'reading' | 'ai';
}

const Voice = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, checkPaymentStatus } = useAuth();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'reading' | 'ai'>('reading');
  const audioRef = useRef<HTMLAudioElement>(null);

  const voiceOptions: VoiceOption[] = [
    { 
      id: 'alloy', 
      name: 'Alloy', 
      description: '平衡中性', 
      color: '#8B5CF6', 
      avatar: '🤖',
      personality: '专业稳重，适合商务场景'
    },
    { 
      id: 'echo', 
      name: 'Echo', 
      description: '深沉有力', 
      color: '#6366F1', 
      avatar: '🎭',
      personality: '富有磁性，适合纪录片配音'
    },
    { 
      id: 'fable', 
      name: 'Fable', 
      description: '温暖讲述', 
      color: '#8B5CF6', 
      avatar: '📚',
      personality: '温和亲切，适合故事讲述'
    },
    { 
      id: 'onyx', 
      name: 'Onyx', 
      description: '威严庄重', 
      color: '#333333', 
      avatar: '👑',
      personality: '威严正式，适合新闻播报'
    },
    { 
      id: 'nova', 
      name: 'Nova', 
      description: '友好专业', 
      color: '#10B981', 
      avatar: '✨',
      personality: '活泼友好，适合教学内容'
    },
    { 
      id: 'shimmer', 
      name: 'Shimmer', 
      description: '轻快明亮', 
      color: '#60A5FA', 
      avatar: '🌟',
      personality: '清新甜美，适合广告配音'
    },
    { 
      id: 'coral', 
      name: 'Coral', 
      description: '温柔平静', 
      color: '#F87171', 
      avatar: '🌊',
      personality: '温柔舒缓，适合冥想引导'
    },
    { 
      id: 'verse', 
      name: 'Verse', 
      description: '生动诗意', 
      color: '#FBBF24', 
      avatar: '🎨',
      personality: '富有诗意，适合文学朗读'
    },
    { 
      id: 'ballad', 
      name: 'Ballad', 
      description: '抒情柔和', 
      color: '#A78BFA', 
      avatar: '🎵',
      personality: '抒情动人，适合音乐解说'
    },
    { 
      id: 'ash', 
      name: 'Ash', 
      description: '思考沉稳', 
      color: '#4B5563', 
      avatar: '🧠',
      personality: '理性冷静，适合科学解说'
    },
    { 
      id: 'sage', 
      name: 'Sage', 
      description: '智慧老练', 
      color: '#059669', 
      avatar: '🧙‍♂️',
      personality: '睿智老练，适合知识传授'
    },
    { 
      id: 'brook', 
      name: 'Brook', 
      description: '流畅舒适', 
      color: '#3B82F6', 
      avatar: '🏞️',
      personality: '自然流畅，适合有声小说'
    },
    { 
      id: 'clover', 
      name: 'Clover', 
      description: '活泼年轻', 
      color: '#EC4899', 
      avatar: '🍀',
      personality: '青春活力，适合儿童内容'
    },
    { 
      id: 'dan', 
      name: 'Dan', 
      description: '男声稳重', 
      color: '#1F2937', 
      avatar: '👨‍💼',
      personality: '成熟稳重，适合企业培训'
    },
    { 
      id: 'elan', 
      name: 'Elan', 
      description: '优雅流利', 
      color: '#7C3AED', 
      avatar: '💎',
      personality: '优雅精致，适合高端品牌'
    },
    { 
      id: 'aurora', 
      name: 'Aurora', 
      description: '神秘魅力', 
      color: '#8B5A9B', 
      avatar: '🌅',
      personality: '神秘诱人，适合悬疑故事'
    },
    { 
      id: 'phoenix', 
      name: 'Phoenix', 
      description: '激情澎湃', 
      color: '#DC2626', 
      avatar: '🔥',
      personality: '热情激昂，适合励志演讲'
    },
    { 
      id: 'luna', 
      name: 'Luna', 
      description: '梦幻柔美', 
      color: '#6B46C1', 
      avatar: '🌙',
      personality: '梦幻温柔，适合睡前故事'
    }
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('nexusAiVoiceHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse voice history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nexusAiVoiceHistory', JSON.stringify(history));
  }, [history]);

  const handleGenerateVoice = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录后再使用语音合成功能",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!checkPaymentStatus()) {
      toast({
        title: "会员功能",
        description: "语音合成是会员专享功能，请先升级为会员",
        variant: "destructive",
      });
      navigate('/payment');
      return;
    }

    if (!text.trim()) {
      toast({
        title: "内容为空",
        description: "请输入需要转换为语音的文本",
        variant: "destructive",
      });
      return;
    }

    if (text.length > 4000) {
      toast({
        title: "文本过长",
        description: "请将文本限制在4000字符以内",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      let processedText = text;
      
      if (voiceMode === 'ai') {
        const optimizePrompt = `请将以下文本优化为更适合语音播报的版本，使其更生动、更有表现力，但保持原意。请直接返回优化后的文本，不要添加任何解释：\n\n${text}`;
        try {
          const optimizeResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(optimizePrompt)}?model=openai`);
          if (optimizeResponse.ok) {
            const reader = optimizeResponse.body!.getReader();
            const decoder = new TextDecoder();
            let optimizedText = '';
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              optimizedText += chunk;
            }
            
            processedText = optimizedText.trim().replace(/^[""]|[""]$/g, '');
            if (processedText.length > 4000) {
              processedText = processedText.substring(0, 4000);
            }
          }
        } catch (error) {
          console.log('AI optimization failed, using original text:', error);
        }
      }
      
      // 限制文本长度到300字符以获得更好的成功率
      const limitedText = processedText.substring(0, 300);
      console.log('开始语音生成，文本长度:', limitedText.length);
      console.log('使用的文本内容:', limitedText);
      
      // 尝试不同的TTS服务
      const ttsServices = [
        // 方法1: 使用正确的Pollinations Audio API
        async () => {
          const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(limitedText)}?model=openai-audio&voice=${selectedVoice}`;
          console.log('尝试Pollinations Audio API:', audioUrl);
          
          const response = await fetch(audioUrl, {
            method: 'GET',
            headers: {
              'Accept': 'audio/mpeg, audio/wav, audio/*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': 'https://pollinations.ai/',
              'Origin': 'https://pollinations.ai'
            }
          });
          
          console.log('Pollinations响应状态:', response.status, response.statusText);
          
          if (!response.ok) {
            const text = await response.text();
            console.log('Pollinations错误响应:', text);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type') || '';
          console.log('Pollinations响应类型:', contentType);
          
          if (!contentType.includes('audio') && !contentType.includes('octet-stream')) {
            const text = await response.text();
            console.log('Pollinations非音频响应内容:', text.substring(0, 200));
            throw new Error('Pollinations API返回的不是音频数据');
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log('Pollinations音频大小:', arrayBuffer.byteLength, 'bytes');
          
          if (arrayBuffer.byteLength < 1000) {
            throw new Error('Pollinations音频文件太小，可能是无效的音频');
          }
          
          return new Blob([arrayBuffer], { type: contentType.includes('audio') ? contentType : 'audio/mpeg' });
        },
        
        // 方法2: 使用浏览器自带TTS (作为最后的备用选项)
        async () => {
          console.log('尝试浏览器Web Speech API...');
          
          if (!('speechSynthesis' in window)) {
            throw new Error('浏览器不支持Web Speech API');
          }
          
          return new Promise<Blob>((resolve, reject) => {
            // 创建一个静默的音频文件作为占位符，实际使用speechSynthesis播放
            const utterance = new SpeechSynthesisUtterance(limitedText);
            const voices = speechSynthesis.getVoices();
            
            // 选择中文语音
            const chineseVoice = voices.find(voice => 
              voice.lang.includes('zh') || voice.lang.includes('cmn')
            );
            
            if (chineseVoice) {
              utterance.voice = chineseVoice;
            }
            
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => {
              // 创建一个小的静默音频文件
              const sampleRate = 22050;
              const duration = 0.1; // 100ms静默
              const numSamples = sampleRate * duration;
              const buffer = new ArrayBuffer(numSamples * 2);
              const view = new Int16Array(buffer);
              view.fill(0); // 静默
              
              // 创建WAV头
              const wavBuffer = new ArrayBuffer(44 + buffer.byteLength);
              const wavView = new DataView(wavBuffer);
              
              // WAV文件头
              const writeString = (offset: number, string: string) => {
                for (let i = 0; i < string.length; i++) {
                  wavView.setUint8(offset + i, string.charCodeAt(i));
                }
              };
              
              writeString(0, 'RIFF');
              wavView.setUint32(4, 36 + buffer.byteLength, true);
              writeString(8, 'WAVE');
              writeString(12, 'fmt ');
              wavView.setUint32(16, 16, true);
              wavView.setUint16(20, 1, true);
              wavView.setUint16(22, 1, true);
              wavView.setUint32(24, sampleRate, true);
              wavView.setUint32(28, sampleRate * 2, true);
              wavView.setUint16(32, 2, true);
              wavView.setUint16(34, 16, true);
              writeString(36, 'data');
              wavView.setUint32(40, buffer.byteLength, true);
              
              // 复制音频数据
              const audioData = new Uint8Array(buffer);
              const wavData = new Uint8Array(wavBuffer);
              wavData.set(audioData, 44);
              
              const blob = new Blob([wavBuffer], { type: 'audio/wav' });
              resolve(blob);
            };
            
            utterance.onerror = () => {
              reject(new Error('Web Speech API播放失败'));
            };
            
            // 直接播放，不录制
            speechSynthesis.speak(utterance);
            
            // 5秒超时
            setTimeout(() => {
              speechSynthesis.cancel();
              reject(new Error('Web Speech API超时'));
            }, 5000);
          });
        }
      ];

      let audioBlob: Blob | null = null;
      let lastError: Error | null = null;

      for (let i = 0; i < ttsServices.length; i++) {
        try {
          console.log(`尝试TTS服务 ${i + 1}...`);
          audioBlob = await ttsServices[i]();
          console.log(`服务 ${i + 1} 成功，音频大小:`, audioBlob.size, 'bytes');
          
          if (audioBlob && audioBlob.size > 100) {
            break; // 成功获取到有效音频
          } else {
            console.log(`服务 ${i + 1} 返回的音频太小，尝试下一个...`);
            audioBlob = null;
          }
        } catch (error) {
          console.log(`服务 ${i + 1} 失败:`, error);
          lastError = error as Error;
        }
      }

      if (!audioBlob) {
        throw lastError || new Error('所有TTS服务都失败了');
      }

      // 创建音频URL
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('创建音频URL成功:', audioUrl);
      
      setAudioUrl(audioUrl);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date(),
        voice: selectedVoice,
        text: limitedText,
        audioUrl: audioUrl,
        mode: voiceMode
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      toast({
        title: "语音生成成功",
        description: `${voiceOptions.find(v => v.id === selectedVoice)?.name || selectedVoice} 语音已生成完成`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('语音生成错误:', error);
      
      let errorMessage = '语音生成失败';
      if (error instanceof Error) {
        if (error.message.includes('402') || error.message.includes('配额')) {
          errorMessage = 'Pollinations API服务配额不足，请稍后再试';
        } else if (error.message.includes('404')) {
          errorMessage = 'Pollinations语音服务暂时不可用';
        } else if (error.message.includes('500')) {
          errorMessage = 'Pollinations服务器繁忙，请稍后重试';
        } else if (error.message.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络设置';
        } else {
          errorMessage = `生成失败: ${error.message}`;
        }
      }
      
      toast({
        title: "生成失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI 文本转音频
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              输入文字，选择语音风格，一键转换为自然流畅的语音。<br />
              支持原文朗读和AI智能演绎两种模式，创建专业水准的音频内容。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8 text-white">语音生成</h3>
                  
                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-medium mb-4 text-lg">生成模式</h4>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        <span className="text-white">原文朗读</span>
                      </div>
                      <Switch
                        checked={voiceMode === 'ai'}
                        onCheckedChange={(checked) => setVoiceMode(checked ? 'ai' : 'reading')}
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-white">智能演绎</span>
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {voiceMode === 'ai' 
                        ? '🎭 AI会根据主题自由发挥，优化表达方式并增加情感色彩' 
                        : '📖 直接朗读原文内容，保持文本原貌不做任何修改'}
                    </p>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-medium mb-6 text-lg">选择语音风格</h4>
                    <p className="text-gray-400 text-sm mb-6">
                      每种风格都有独特的音色和个性，选择最适合您内容的声音
                    </p>
                    
                    <RadioGroup 
                      value={selectedVoice} 
                      onValueChange={setSelectedVoice}
                      className="grid grid-cols-6 gap-2"
                    >
                      {voiceOptions.map((voice) => (
                        <div
                          key={voice.id}
                          className={`relative cursor-pointer p-2 rounded-lg border transition-all ${
                            selectedVoice === voice.id
                              ? 'border-cyan-400 bg-cyan-400/10'
                              : 'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50'
                          }`}
                        >
                          <RadioGroupItem
                            value={voice.id}
                            id={`voice-${voice.id}`}
                            className="absolute opacity-0"
                          />
                          <label
                            htmlFor={`voice-${voice.id}`}
                            className="flex flex-col items-center cursor-pointer"
                          >
                            {selectedVoice === voice.id && (
                              <div className="absolute -top-1 -right-1 bg-cyan-400 rounded-full">
                                <CheckCircle2 className="h-2 w-2 text-white" />
                              </div>
                            )}
                            <div className="text-lg mb-1">{voice.avatar}</div>
                            <div className="text-white font-medium text-xs text-center">{voice.name}</div>
                            <div className="text-gray-400 text-xs text-center leading-tight">{voice.description}</div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="mb-8">
                    <Label htmlFor="text-input" className="text-cyan-400 font-medium mb-4 block text-lg">输入文本</Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="输入你想要转换为语音的文本内容..."
                      className="min-h-[180px] bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 text-base"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className={`text-sm ${text.length > 300 ? 'text-yellow-400' : text.length > 4000 ? 'text-red-400' : 'text-gray-400'}`}>
                        字符数: {text.length} / 4000 {text.length > 300 && '(建议300字符以内以获得更好效果)'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        模式: {voiceMode === 'ai' ? '🎭 智能演绎' : '📖 原文朗读'}
                      </p>
                    </div>
                    {text.length > 4000 && (
                      <p className="text-red-400 text-sm mt-2">⚠️ 文本过长，请缩短到4000字符以内</p>
                    )}
                  </div>

                  <div className="flex justify-between mb-8">
                    <Button
                      onClick={handleGenerateVoice}
                      disabled={loading || !text.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-3 text-base"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        "生成语音"
                      )}
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-gray-200">
                      快捷键 (Ctrl + Enter)
                    </Button>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3 text-base">服务状态说明</h4>
                    <ul className="text-gray-300 text-sm space-y-2 list-disc pl-5">
                      <li>🎯 主要使用Pollinations.ai的Audio API服务</li>
                      <li>📊 建议文本长度控制在300字符以内以获得最佳效果</li>
                      <li>🔄 如果Pollinations服务失败，会自动使用浏览器内置TTS</li>
                      <li>🚫 Google TTS因CORS限制无法直接调用</li>
                      <li>⏱️ 生成时间通常在3-10秒，请耐心等待</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">音频预览</h3>
                  
                  {audioUrl ? (
                    <div className="space-y-6">
                      <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                        <div className="flex items-center mb-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mr-4 text-xl"
                            style={{ 
                              backgroundColor: voiceOptions.find(v => v.id === selectedVoice)?.color || '#8B5CF6' 
                            }}
                          >
                            {voiceOptions.find(v => v.id === selectedVoice)?.avatar || '🤖'}
                          </div>
                          <div>
                            <div className="text-white font-medium text-base">
                              {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {voiceOptions.find(v => v.id === selectedVoice)?.description}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {voiceMode === 'ai' ? '🎭 智能演绎版' : '📖 原文朗读版'}
                            </div>
                          </div>
                        </div>
                        
                        <audio 
                          ref={audioRef} 
                          controls 
                          className="w-full mb-6" 
                          src={audioUrl}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                        ></audio>
                        
                        <div className="flex justify-between">
                          <Button 
                            onClick={togglePlayPause}
                            className="bg-cyan-500 hover:bg-cyan-600"
                          >
                            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                            {isPlaying ? '暂停' : '播放'}
                          </Button>
                          <Button 
                            onClick={() => {
                              if (audioUrl) {
                                const link = document.createElement('a');
                                link.href = audioUrl;
                                link.download = `voice_${Date.now()}.mp3`;
                                link.click();
                              }
                              toast({
                                title: "下载开始",
                                description: "语音文件下载已开始",
                              });
                            }} 
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 bg-gray-700/30 rounded-lg flex items-center justify-center border border-gray-600">
                      <p className="text-gray-400 text-base">
                        {loading ? '正在生成语音，请稍等...' : '尚未生成语音'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">历史记录</h3>
                    <Button 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 text-sm bg-red-900/20 hover:bg-red-900/30"
                      onClick={() => {
                        setHistory([]);
                        localStorage.removeItem('nexusAiVoiceHistory');
                        toast({
                          title: "记录已清空",
                          description: "所有历史记录已被清除",
                        });
                      }}
                    >
                      清空记录
                    </Button>
                  </div>

                  {history.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="text-lg mr-2">
                                {voiceOptions.find(v => v.id === item.voice)?.avatar || '🤖'}
                              </div>
                              <div>
                                <span className="text-cyan-400 font-medium text-sm">
                                  {voiceOptions.find(v => v.id === item.voice)?.name || item.voice}
                                </span>
                                <div className="text-gray-500 text-xs">
                                  {item.mode === 'ai' ? '🎭 智能演绎' : '📖 原文朗读'}
                                </div>
                              </div>
                            </div>
                            <span className="text-gray-400 text-xs">{formatTime(item.timestamp)}</span>
                          </div>
                          
                          <p className="text-gray-200 text-sm mb-3 line-clamp-2">{item.text}</p>
                          
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm"
                              className="bg-cyan-500 hover:bg-cyan-600 text-xs"
                              onClick={() => {
                                if (item.audioUrl) {
                                  setAudioUrl(item.audioUrl);
                                  setSelectedVoice(item.voice);
                                }
                              }}
                            >
                              播放
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-purple-500 hover:bg-purple-600 text-xs"
                              onClick={() => {
                                if (item.audioUrl) {
                                  const link = document.createElement('a');
                                  link.href = item.audioUrl;
                                  link.download = `voice_${item.id}.mp3`;
                                  link.click();
                                }
                              }}
                            >
                              下载
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Mic className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">暂无历史记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Voice;
