
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Volume2, 
  Play, 
  Download, 
  CheckCircle2
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
  const audioRef = useRef<HTMLAudioElement>(null);

  // Voice options - expanded to 16 options matching the screenshot
  const voiceOptions: VoiceOption[] = [
    { id: 'alloy', name: 'Alloy', description: '平衡中性', color: '#8B5CF6' },
    { id: 'echo', name: 'Echo', description: '深沉有力', color: '#6366F1' },
    { id: 'fable', name: 'Fable', description: '温暖讲述', color: '#8B5CF6' },
    { id: 'onyx', name: 'Onyx', description: '威严庄重', color: '#333333' },
    { id: 'nova', name: 'Nova', description: '友好专业', color: '#10B981' },
    { id: 'shimmer', name: 'Shimmer', description: '轻快明亮', color: '#60A5FA' },
    { id: 'coral', name: 'Coral', description: '温柔平静', color: '#F87171' },
    { id: 'verse', name: 'Verse', description: '生动诗意', color: '#FBBF24' },
    { id: 'ballad', name: 'Ballad', description: '抒情柔和', color: '#A78BFA' },
    { id: 'ash', name: 'Ash', description: '思考沉稳', color: '#4B5563' },
    { id: 'sage', name: 'Sage', description: '智慧老练', color: '#059669' },
    { id: 'brook', name: 'Brook', description: '流畅舒适', color: '#3B82F6' },
    { id: 'clover', name: 'Clover', description: '活泼年轻', color: '#EC4899' },
    { id: 'dan', name: 'Dan', description: '男声稳重', color: '#1F2937' },
    { id: 'elan', name: 'Elan', description: '优雅流利', color: '#7C3AED' },
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
      const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${selectedVoice}&nologo=true`;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAudioUrl(url);
      
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
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Navigation />
      
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI 文本转音频
            </h1>
            <p className="text-gray-400 mb-6">
              输入文字，选择语音风格，一键转换字转换为自然流畅的语音。<br />
              支持多种音色音调，帮您创建专业水准的音频内容。
            </p>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6">
              免费体验
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧控制面板 */}
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 text-white">语音生成</h3>
                  
                  <div className="mb-6">
                    <h4 className="text-cyan-400 font-medium mb-4">选择语音风格</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      每种风格都有其独特的音色和表现力，选择最适合您内容的声音
                    </p>
                    
                    <RadioGroup 
                      value={selectedVoice} 
                      onValueChange={setSelectedVoice}
                      className="grid grid-cols-3 gap-3"
                    >
                      {voiceOptions.map((voice) => (
                        <div
                          key={voice.id}
                          className={`relative cursor-pointer p-3 rounded-lg border transition-all ${
                            selectedVoice === voice.id
                              ? 'border-cyan-400 bg-cyan-400/10'
                              : 'border-gray-600 bg-gray-800/40 hover:bg-gray-700/40'
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
                              <div className="absolute -top-2 -right-2 bg-cyan-400 rounded-full">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="text-white font-medium text-sm">{voice.name}</div>
                            <div className="text-gray-400 text-xs">{voice.description}</div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="text-input" className="text-cyan-400 font-medium mb-3 block">输入文本</Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="使用中国官方说明语法，如测试AI视频合成，可以直接文字转换前缀：请保持文本"
                      className="min-h-[150px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-400 text-sm">字符数: {text.length}</p>
                      <p className="text-gray-400 text-sm">色彩节律: 不调整</p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <Button
                      onClick={handleGenerateVoice}
                      disabled={loading || !text.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-2"
                    >
                      {loading ? "生成中..." : "生成语音"}
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      按住对话 (Ctrl + ↵ Enter)
                    </Button>
                  </div>

                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">使用小技巧</h4>
                    <ul className="text-gray-400 text-sm space-y-1 list-disc pl-5">
                      <li>输入适当的可明确描述的音频的简话和语调变化</li>
                      <li>不同音频风格适合不同场景，可以尝试多种风格找到最适合的</li>
                      <li>大段文本可以分为多个短段，生成后合并，效果更佳</li>
                      <li>特殊专业术语可能需要注音或微调以获得更准确的发音</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧音频预览区域 */}
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">音频预览</h3>
                  
                  {audioUrl ? (
                    <div className="space-y-4">
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                            style={{ 
                              backgroundColor: voiceOptions.find(v => v.id === selectedVoice)?.color || '#8B5CF6' 
                            }}
                          >
                            <Volume2 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {voiceOptions.find(v => v.id === selectedVoice)?.description}
                            </div>
                          </div>
                        </div>
                        
                        <audio ref={audioRef} controls className="w-full mb-4" src={audioUrl}></audio>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => {
                              toast({
                                title: "下载开始",
                                description: "语音文件下载已开始",
                              });
                            }} 
                            className="bg-cyan-500 hover:bg-cyan-600"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">
                        {loading ? '正在生成语音，请稍等...' : '尚未生成语音'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">历史记录</h3>
                    <Button 
                      variant="ghost" 
                      className="text-red-400 hover:text-red-300 text-sm bg-red-400/10 hover:bg-red-400/20"
                    >
                      清空记录
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                    <p className="text-yellow-400 text-sm">
                      生成记录提醒：后台正在处理，请等待下载。
                    </p>
                  </div>

                  {history.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                              <span className="text-cyan-400 font-medium text-sm">
                                {voiceOptions.find(v => v.id === item.voice)?.name || item.voice}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs">{formatTime(item.timestamp)}</span>
                          </div>
                          
                          <p className="text-white text-sm mb-2 line-clamp-2">{item.text}</p>
                          
                          <div className="flex justify-end">
                            <Button 
                              size="sm"
                              className="bg-cyan-500 hover:bg-cyan-600 text-xs"
                              onClick={() => setAudioUrl(item.audioUrl)}
                            >
                              下载
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">暂无历史记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">语音特性</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm">自然流畅的语音合成，接近真人发音</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm">多种声音风格可选，满足不同场景需求</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm">支持长文本转语音转换，适合各种内容创作</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm">一键下载MP3格式音频，可用于多平台分享</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-white text-sm">本地保存历史记录，方便重复使用和批量处理</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Voice;
