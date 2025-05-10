
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Volume2, 
  Play, 
  Download, 
  Clock, 
  AlignLeft, 
  RotateCcw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface HistoryItem {
  id: number;
  timestamp: Date;
  voice: string;
  text: string;
  audioUrl?: string;
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
  const [exactReading, setExactReading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Voice options
  const voiceOptions: VoiceOption[] = [
    { id: 'alloy', name: 'Alloy', description: '平衡中性', color: '#4F46E5' },
    { id: 'echo', name: 'Echo', description: '深沉有力', color: '#6366F1' },
    { id: 'fable', name: 'Fable', description: '温暖讲述', color: '#8B5CF6' },
    { id: 'onyx', name: 'Onyx', description: '威严庄重', color: '#333333' },
    { id: 'nova', name: 'Nova', description: '友好专业', color: '#10B981' },
    { id: 'shimmer', name: 'Shimmer', description: '轻快明亮', color: '#60A5FA' },
    { id: 'coral', name: 'Coral', description: '温柔平静', color: '#F87171' },
    { id: 'verse', name: 'Verse', description: '生动诗意', color: '#FBBF24' },
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
      // Prepare the text with optional prefix for exact reading
      let processedText = text;
      if (exactReading) {
        processedText = `请严格按照以下内容朗读，不要做任何修改或演绎：${text}`;
      }

      // Create the URL with the encoded text and selected voice
      const url = `https://text.pollinations.ai/${encodeURIComponent(processedText)}?model=openai-audio&voice=${selectedVoice}&nologo=true`;
      
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you'd fetch the audio from the API
      // const response = await fetch(url);
      // const audioBlob = await response.blob();
      // const audioUrl = URL.createObjectURL(audioBlob);
      
      // For now, we'll just use the URL directly as if it was successful
      setAudioUrl(url);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date(),
        voice: selectedVoice,
        text: text,
        audioUrl: url
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      toast({
        title: "语音生成成功",
        description: "您的文本已成功转换为语音",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "生成失败",
        description: "语音生成过程中发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([]);
      toast({
        title: "历史已清空",
        description: "语音生成历史记录已被清除",
      });
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
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 pt-20 md:p-20">
        {/* Left Panel - Text Input and Voice Selection */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <Card className="p-5 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
              <Volume2 className="mr-2 h-6 w-6 text-nexus-cyan" />
              AI 语音合成
            </h2>
            
            <Tabs defaultValue="voice" className="w-full mb-6">
              <TabsList className="grid grid-cols-2 w-full bg-nexus-dark/50">
                <TabsTrigger value="voice" className="data-[state=active]:bg-nexus-blue text-white">选择声音</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-nexus-blue text-white">高级设置</TabsTrigger>
              </TabsList>
              
              <TabsContent value="voice" className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {voiceOptions.map(voice => (
                    <div 
                      key={voice.id}
                      className={`relative cursor-pointer p-3 rounded-lg border transition-all ${
                        selectedVoice === voice.id 
                          ? 'border-nexus-cyan bg-nexus-cyan/10' 
                          : 'border-nexus-blue/20 bg-nexus-dark/40 hover:bg-nexus-dark/60'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      {selectedVoice === voice.id && (
                        <div className="absolute -top-2 -right-2 bg-nexus-cyan rounded-full">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: voice.color }}
                      >
                        <Volume2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-white font-medium">{voice.name}</div>
                      <div className="text-white/60 text-sm">{voice.description}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="pt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-nexus-blue/10 border border-nexus-blue/20 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-nexus-cyan mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/80">
                        在这里可以调整其他TTS引擎参数，如速度，音高等（当前版本暂未实现）
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mb-4">
              <Label htmlFor="text-input" className="text-white mb-2 block">输入文本</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入需要转换为语音的文本内容..."
                className="min-h-[200px] bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
              />
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-white/70 text-sm">
                  <div className="flex items-center">
                    <AlignLeft className="h-4 w-4 mr-1" />
                    <span>字符数: {text.length}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>预计时长: {Math.max(1, Math.ceil(text.length / 150))}秒</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-nexus-dark/50 rounded-lg border border-nexus-blue/20">
                <div className="flex items-center mb-3 sm:mb-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${exactReading ? 'bg-nexus-cyan' : 'bg-nexus-blue/50'}`}></div>
                    <span className="text-white font-medium mr-2">朗读模式:</span>
                  </div>
                  <div className="relative flex items-center space-x-2">
                    <span className={`text-sm ${!exactReading ? 'text-white' : 'text-white/50'}`}>智能演绎</span>
                    <Switch
                      checked={exactReading}
                      onCheckedChange={setExactReading}
                    />
                    <span className={`text-sm ${exactReading ? 'text-white' : 'text-white/50'}`}>严格原文</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateVoice} 
                  disabled={loading || !text.trim()}
                  className="bg-nexus-blue hover:bg-nexus-blue/80 w-full sm:w-auto"
                >
                  {loading ? "生成中..." : "生成语音"}
                </Button>
              </div>
            </div>
            
            <div className="mt-4 bg-nexus-blue/10 border border-nexus-blue/20 rounded-lg p-3">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-nexus-cyan mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/80">
                  {exactReading
                    ? "严格朗读模式已开启，AI将按原文精确朗读，不添加额外语气或演绎。"
                    : "智能演绎模式已开启，AI可能会对文本进行自然语气调整，使朗读更加自然流畅。"}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Panel - Audio Output and History */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <Card className="p-5 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
              <Play className="mr-2 h-6 w-6 text-nexus-cyan" />
              语音播放
            </h2>
            
            {audioUrl ? (
              <div>
                <div className="mb-4 p-4 bg-nexus-dark/40 rounded-lg border border-nexus-blue/20">
                  <div className="flex items-center mb-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: voiceOptions.find(v => v.id === selectedVoice)?.color || '#4F46E5' 
                      }}
                    >
                      <Volume2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                      </div>
                      <div className="text-white/60 text-xs">
                        {voiceOptions.find(v => v.id === selectedVoice)?.description}
                      </div>
                    </div>
                  </div>
                  
                  <audio ref={audioRef} controls className="w-full" src={audioUrl}></audio>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setAudioUrl(null)} className="border-nexus-blue/30 text-white">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    重新生成
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      // In a real app, you would trigger a download here
                      toast({
                        title: "下载开始",
                        description: "语音文件下载已开始",
                      });
                    }} 
                    className="bg-nexus-blue hover:bg-nexus-blue/80"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载语音
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-nexus-dark/40 rounded-lg border border-nexus-blue/20 text-white/50">
                <Volume2 className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg">尚未生成语音</p>
                <p className="text-sm">在左侧输入文本并选择声音后生成</p>
              </div>
            )}
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center text-white">
                <Clock className="mr-2 h-5 w-5 text-nexus-cyan" />
                历史记录
              </h2>
              
              {history.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearHistory}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  清空
                </Button>
              )}
            </div>
            
            {history.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-lg bg-nexus-dark/40 border border-nexus-blue/10 hover:border-nexus-blue/30 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                          style={{ 
                            backgroundColor: voiceOptions.find(v => v.id === item.voice)?.color || '#4F46E5' 
                          }}
                        >
                          <Volume2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-white font-medium text-sm">
                          {voiceOptions.find(v => v.id === item.voice)?.name || item.voice}
                        </span>
                      </div>
                      <span className="text-white/50 text-xs">{formatTime(item.timestamp)}</span>
                    </div>
                    
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">{item.text}</p>
                    
                    {item.audioUrl && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-nexus-cyan hover:text-nexus-cyan/80 hover:bg-nexus-blue/10"
                          onClick={() => setAudioUrl(item.audioUrl)}
                        >
                          <Play className="mr-1 h-3 w-3" /> 播放
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24 text-white/50">
                <p>暂无历史记录</p>
              </div>
            )}
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Voice;
