
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Volume2, 
  Download, 
  CheckCircle2,
  BookText,
  Sparkles,
  User, Mic, Speaker, Feather, Smile, Music, Heart, Star, Sun, Cloud, Gift, Bell, Camera, Film,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  color: string;
  gender?: 'male' | 'female' | 'neutral';
  avatarUrl?: string;
}

interface HistoryItem {
  id: number;
  timestamp: Date;
  voice: string;
  text: string;
  audioUrl?: string;
  readingMode: 'strict' | 'interpretive';
  rephrasedText?: string;
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
  const [readingMode, setReadingMode] = useState<'strict' | 'interpretive'>('strict');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Function to generate a consistent color based on string hash
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const baseVoiceOptions: (Omit<VoiceOption, 'avatarUrl'> & { gender?: 'male' | 'female' | 'neutral' })[] = [
    { id: 'alloy', name: 'Alloy', description: '平衡中性', color: '#00D4AA', gender: 'male' },
    { id: 'echo', name: 'Echo', description: '深沉有力', color: '#1E40AF', gender: 'male' },
    { id: 'fable', name: 'Fable', description: '温暖讲述', color: '#F59E0B', gender: 'female' },
    { id: 'onyx', name: 'Onyx', description: '威严庄重', color: '#374151', gender: 'male' },
    { id: 'nova', name: 'Nova', description: '友好专业', color: '#8B5CF6', gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', description: '轻快明亮', color: '#EC4899', gender: 'female' },
    { id: 'coral', name: 'Coral', description: '温柔平静', color: '#F97316', gender: 'female' },
    { id: 'verse', name: 'Verse', description: '生动诗意', color: '#10B981', gender: 'male' },
    { id: 'ballad', name: 'Ballad', description: '抒情柔和', color: '#EF4444', gender: 'female' },
    { id: 'ash', name: 'Ash', description: '思考沉稳', color: '#6B7280', gender: 'male' },
    { id: 'sage', name: 'Sage', description: '智慧老练', color: '#059669', gender: 'male' },
    { id: 'amuch', name: 'Amuch', description: '清晰有力', color: '#DC2626', gender: 'male' },
    { id: 'aster', name: 'Aster', description: '柔和自然', color: '#7C3AED', gender: 'female' },
    { id: 'brook', name: 'Brook', description: '流畅舒适', color: '#0891B2', gender: 'female' },
    { id: 'clover', name: 'Clover', description: '活泼年轻', color: '#65A30D', gender: 'female' },
    { id: 'dan', name: 'Dan', description: '男声稳重', color: '#B45309', gender: 'male' },
    { id: 'elan', name: 'Elan', description: '优雅流利', color: '#BE185D', gender: 'female' },
    { id: 'marilyn', name: 'Marilyn', description: '甜美悦耳', color: '#C026D3', gender: 'female' },
    { id: 'meadow', name: 'Meadow', description: '清新宁静', color: '#16A34A', gender: 'female' },
    { id: 'system', name: 'System Voice', description: '系统内置语音', color: '#6366F1', gender: 'neutral' },
  ];

  const voiceOptions: VoiceOption[] = baseVoiceOptions.map((voice, index) => {
    const seed = voice.name.replace(/\s/g, '');
    const avatarType = 'avataaars';
    
    const newVoice: VoiceOption = {
      id: voice.id,
      name: voice.name,
      description: voice.description,
      color: voice.color,
      ...(voice.gender && { gender: voice.gender }), 
      avatarUrl: `https://api.dicebear.com/7.x/${avatarType}/svg?seed=${seed}&backgroundColor=transparent`
    };
    return newVoice;
  });

  const voiceIcons = [
    User, Mic, Speaker, Feather, Smile, Sparkles, Music, Heart, Star, Sun, Cloud, Gift, Bell, Camera, Film, BookText, Volume2
  ];

  const getVoiceIcon = (index: number) => {
    return voiceIcons[index % voiceIcons.length];
  };

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
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('synthesize-voice', {
        body: {
          text: text,
          voice: selectedVoice,
          readingMode: readingMode
        }
      });

      if (error) {
        throw new Error(error.message || "语音合成调用失败");
      }

      if (!data || !data.audioContent) {
        throw new Error('未收到音频数据');
      }

      // Convert base64 audio data to Blob
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const generatedAudioUrl = URL.createObjectURL(audioBlob);
      
      setAudioUrl(generatedAudioUrl);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date(),
        voice: selectedVoice,
        text: text,
        audioUrl: generatedAudioUrl,
        readingMode: readingMode,
        rephrasedText: undefined
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      toast({
        title: "语音生成成功",
        description: "您的文本已成功转换为语音",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast({
        title: "生成失败", 
        description: error.message || "语音生成过程中发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
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

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nexusAiVoiceHistory');
    toast({
      title: "历史记录已清空",
      description: "所有生成历史已删除",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* NFT Style Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
                AI 文本转音频
              </h1>
            </div>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed">
              输入文字，选择语音风格，一键转换为自然流畅的语音。<br />
              支持多种音色音调，帮您创建专业水准的音频内容。
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Panel - Voice Generation */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    语音生成
                  </h3>
                  
                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-semibold mb-4 text-lg flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      选择语音风格
                    </h4>
                    <p className="text-slate-400 text-sm mb-6">
                      每种风格都有其独特的音色和表现力，选择最适合您内容的声音
                    </p>
                    
                    <RadioGroup 
                      value={selectedVoice} 
                      onValueChange={setSelectedVoice}
                      className="grid grid-cols-5 gap-4"
                    >
                      {voiceOptions.map((voice, index) => {
                        const VoiceIcon = getVoiceIcon(index);
                        return (
                          <div
                            key={voice.id}
                            className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                              selectedVoice === voice.id
                                ? 'border-cyan-400 bg-gradient-to-b from-cyan-400/20 to-blue-500/20 shadow-lg shadow-cyan-400/25'
                                : 'border-slate-600/30 bg-gradient-to-b from-slate-700/50 to-slate-800/50 hover:border-slate-500/50'
                            }`}
                          >
                            <RadioGroupItem
                              value={voice.id}
                              id={`voice-${voice.id}`}
                              className="absolute opacity-0"
                            />
                            <label
                              htmlFor={`voice-${voice.id}`}
                              className="flex flex-col items-center cursor-pointer p-4"
                            >
                              {selectedVoice === voice.id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-lg"
                                style={{ backgroundColor: voice.color }}
                              >
                                {voice.avatarUrl ? (
                                  <img 
                                    src={voice.avatarUrl} 
                                    alt={voice.name} 
                                    className="w-10 h-10 rounded-lg"
                                    onError={(e) => { 
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const iconElement = target.nextElementSibling as HTMLElement;
                                      if (iconElement) iconElement.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ display: voice.avatarUrl ? 'none' : 'flex' }}
                                >
                                  <VoiceIcon className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div className="text-white font-semibold text-sm text-center">{voice.name}</div>
                              <div className="text-slate-400 text-xs text-center mt-1">{voice.description}</div>
                            </label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-semibold mb-4 text-lg flex items-center gap-2">
                      <BookText className="w-5 h-5" />
                      朗读模式
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => setReadingMode('strict')}
                        className={`h-16 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 ${
                          readingMode === 'strict'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/30'
                        }`}
                        size="lg"
                      >
                        <BookText className="h-5 w-5" />
                        <span className="font-semibold">原文朗读</span>
                      </Button>
                      <Button
                        onClick={() => setReadingMode('interpretive')}
                        className={`h-16 flex flex-col items-center gap-2 rounded-xl transition-all duration-300 ${
                          readingMode === 'interpretive'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/30'
                        }`}
                        size="lg"
                      >
                        <Sparkles className="h-5 w-5" />
                        <span className="font-semibold">智能演绎</span>
                      </Button>
                    </div>
                    <p className="text-slate-400 text-sm mt-3 text-center">
                      {readingMode === 'strict' ? '严格按照输入文本朗读' : 'AI将以富有表现力的方式朗读您的文本'}
                    </p>
                  </div>

                  <div className="mb-8">
                    <Label className="text-cyan-400 font-semibold mb-4 block text-lg flex items-center gap-2">
                      <Feather className="w-5 h-5" />
                      输入文本
                    </Label>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="在这里输入您的文本..."
                      className="min-h-[200px] bg-slate-800/50 border-slate-600/30 text-white placeholder-slate-400 focus:border-cyan-400 text-lg rounded-xl resize-none backdrop-blur-sm"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-slate-400 text-sm">字符数: {text.length}</p>
                      <p className="text-slate-400 text-sm">建议: 不超过800字符</p>
                    </div>
                  </div>

                  <div className="flex justify-center mb-8">
                    <Button
                      onClick={handleGenerateVoice}
                      disabled={loading || !text.trim()}
                      size="lg"
                      className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-2xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-3 h-5 w-5" />
                          生成语音
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-cyan-400" />
                      使用小技巧
                    </h4>
                    <ul className="text-slate-300 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        输入适当的可明确描述音频的简洁语调变化
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        不同音频风格适合不同场景，可以尝试多种风格找到最适合的
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        大段文本可以分为多个短段，生成后合并，效果更佳
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Audio Preview & History */}
            <div className="space-y-6">
              {/* Audio Preview */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                      <Play className="w-4 h-4" />
                    </div>
                    音频预览
                  </h3>
                  
                  {audioUrl ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm">
                        <div className="flex items-center mb-6">
                          <div 
                            className="w-16 h-16 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                            style={{ 
                              background: `linear-gradient(135deg, ${voiceOptions.find(v => v.id === selectedVoice)?.color || '#8B5CF6'}, ${voiceOptions.find(v => v.id === selectedVoice)?.color || '#8B5CF6'}80)`
                            }}
                          >
                            <Volume2 className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-bold text-xl">
                              {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                            </div>
                            <div className="text-slate-400 text-base">
                              {voiceOptions.find(v => v.id === selectedVoice)?.description}
                            </div>
                          </div>
                        </div>
                        
                        <audio 
                          ref={audioRef} 
                          src={audioUrl}
                          className="w-full mb-6 rounded-lg"
                          controls
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                        />
                        
                        <div className="flex justify-center">
                          <Button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = audioUrl;
                              link.download = `nexus-ai-voice-${Date.now()}.mp3`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast({
                                title: "下载开始",
                                description: "语音文件下载已开始",
                              });
                            }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
                          >
                            <Download className="mr-2 h-5 w-5" />
                            下载音频
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-600/30">
                      <div className="text-center">
                        <Volume2 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">
                          {loading ? '正在生成语音，请稍等...' : '尚未生成语音'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* History */}
              <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      历史记录
                    </h3>
                    <Button 
                      variant="ghost" 
                      onClick={clearHistory}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl"
                    >
                      清空记录
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                    <p className="text-yellow-300 text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      生成记录提醒：后台正在处理，请等待下载。
                    </p>
                  </div>

                  {history.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mr-3"></div>
                              <span className="text-cyan-400 font-semibold text-sm">
                                {voiceOptions.find(v => v.id === item.voice)?.name || item.voice}
                              </span>
                              <span 
                                className="ml-3 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ 
                                  backgroundColor: item.readingMode === 'strict' ? '#10B98120' : '#8B5CF620',
                                  color: item.readingMode === 'strict' ? '#10B981' : '#8B5CF6',
                                  border: `1px solid ${item.readingMode === 'strict' ? '#10B981' : '#8B5CF6'}40`
                                }}
                              >
                                {item.readingMode === 'strict' ? '原文' : '演绎'}
                              </span>
                            </div>
                            <span className="text-slate-400 text-xs">{formatTime(item.timestamp)}</span>
                          </div>
                          
                          <p className="text-white text-sm mb-3 line-clamp-2 leading-relaxed">{item.text}</p>
                          
                          <div className="flex justify-end">
                            {item.audioUrl ? (
                              <Button 
                                size="sm"
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                                onClick={() => setAudioUrl(item.audioUrl)}
                              >
                                <Play className="mr-1 h-3 w-3" />
                                播放
                              </Button>
                            ) : (
                              <span className="text-slate-500 text-xs bg-slate-700/50 px-3 py-1 rounded-lg">无音频</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">暂无历史记录</p>
                      <p className="text-slate-500 text-sm mt-2">开始生成语音后，记录将显示在这里</p>
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
