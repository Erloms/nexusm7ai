
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
  Sparkles
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';

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

  // 18个语音选项
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

  // Load history from localStorage
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

  // Save history to localStorage whenever it changes
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

    setLoading(true);
    
    try {
      let processedText = text;
      
      // 如果是智能演绎模式，先用AI优化文本
      if (voiceMode === 'ai') {
        const optimizePrompt = `请将以下文本优化为更适合语音播报的版本，使其更生动、更有表现力，但保持原意：\n\n${text}`;
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
          
          processedText = optimizedText;
        }
      }
      
      // 使用OpenAI TTS API (通过Supabase Edge Function)
      const supabase = (await import('@/integrations/supabase/client')).supabase;
      
      console.log('Calling TTS function with:', {
        text: processedText,
        voice: selectedVoice
      });

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: processedText,
          voice: selectedVoice
        }
      });

      if (error) {
        console.error('TTS function error:', error);
        throw new Error(error.message || '语音生成失败');
      }

      if (data && data.audioContent) {
        // Convert base64 to blob
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          timestamp: new Date(),
          voice: selectedVoice,
          text: text,
          audioUrl: audioUrl,
          mode: voiceMode
        };
        
        setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
        
        toast({
          title: "语音生成成功",
          description: voiceMode === 'ai' ? "AI智能演绎版本已生成" : "原文朗读版本已生成",
          variant: "default",
        });
      } else {
        throw new Error('API返回的数据格式错误');
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "生成失败",
        description: `语音生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
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
          {/* 标题区域 */}
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
            {/* 左侧控制面板 */}
            <div className="space-y-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8 text-white">语音生成</h3>
                  
                  {/* 模式切换 */}
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
                        ? '🎭 AI会优化文本，增加表现力和情感色彩' 
                        : '📖 直接朗读原文，保持文本原貌'}
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
                      <p className="text-gray-400 text-sm">字符数: {text.length}</p>
                      <p className="text-gray-400 text-sm">
                        模式: {voiceMode === 'ai' ? '🎭 智能演绎' : '📖 原文朗读'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-8">
                    <Button
                      onClick={handleGenerateVoice}
                      disabled={loading || !text.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-3 text-base"
                    >
                      {loading ? "生成中..." : "生成语音"}
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-gray-200">
                      快捷键 (Ctrl + Enter)
                    </Button>
                  </div>

                  <div className="bg-gray-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3 text-base">使用小技巧</h4>
                    <ul className="text-gray-300 text-sm space-y-2 list-disc pl-5">
                      <li>智能演绎模式会让AI优化文本表达，增加情感色彩</li>
                      <li>原文朗读模式保持原文不变，适合正式文档</li>
                      <li>不同音频风格适合不同场景，可以尝试多种风格</li>
                      <li>大段文本可以分为多个短段，生成后合并效果更佳</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧音频预览和历史区域 */}
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
