
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Download, Clock, Music, History, Trash2, Volume2, Loader2, FileText, Lightbulb, AlertTriangle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface VoiceStyle {
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
  previewText: string;
  audioUrl?: string;
}

const Voice: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [charCount, setCharCount] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState<string>("0 秒");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const CHARS_PER_MINUTE = 150;

  const voiceStyles: VoiceStyle[] = [
    { id: "alloy", name: "Alloy", description: "平衡中性", color: "bg-indigo-600" },
    { id: "echo", name: "Echo", description: "深沉有力", color: "bg-indigo-500" },
    { id: "fable", name: "Fable", description: "温暖讲述", color: "bg-purple-600" },
    { id: "onyx", name: "Onyx", description: "威严庄重", color: "bg-gray-800" },
    { id: "nova", name: "Nova", description: "友好专业", color: "bg-emerald-600" },
    { id: "shimmer", name: "Shimmer", description: "轻快明亮", color: "bg-blue-500" },
    { id: "coral", name: "Coral", description: "温柔平静", color: "bg-rose-500" },
    { id: "verse", name: "Verse", description: "生动诗意", color: "bg-amber-500" },
    { id: "ballad", name: "Ballad", description: "抒情柔和", color: "bg-violet-500" },
    { id: "ash", name: "Ash", description: "思考沉稳", color: "bg-gray-600" },
    { id: "sage", name: "Sage", description: "智慧老练", color: "bg-green-700" },
    { id: "amuch", name: "Amuch", description: "饱满自然", color: "bg-orange-500" },
    { id: "aster", name: "Aster", description: "清晰直接", color: "bg-blue-700" },
    { id: "brook", name: "Brook", description: "流畅舒适", color: "bg-blue-600" },
    { id: "clover", name: "Clover", description: "活泼年轻", color: "bg-pink-600" },
    { id: "dan", name: "Dan", description: "男声稳重", color: "bg-gray-900" }
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    updateTextStats();
  }, [text]);

  const updateTextStats = () => {
    const count = text.trim().length;
    setCharCount(count);
    
    // Calculate and update duration estimate
    const durationMinutes = count / CHARS_PER_MINUTE;
    let durationText;
    if (durationMinutes < 1/60) {
      durationText = '不到1秒';
    } else if (durationMinutes < 1) {
      const seconds = Math.round(durationMinutes * 60);
      durationText = `${seconds} 秒`;
    } else {
      const minutes = Math.floor(durationMinutes);
      const seconds = Math.round((durationMinutes - minutes) * 60);
      if (seconds === 0) {
        durationText = `${minutes} 分钟`;
      } else {
        durationText = `${minutes} 分钟 ${seconds} 秒`;
      }
    }
    setEstimatedDuration(durationText);
  };

  const generateAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "请输入文本内容",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setAudioSrc(null);

    try {
      // In a real application, this would be your backend API call
      // For now, we'll simulate the API call to Pollinations.ai
      const url = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${selectedVoice}`;
      
      // Simulating a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, we'd fetch the audio blob here
      // For now, just set the audio source directly
      setAudioSrc(url);
      
      // Save to history
      const timestamp = new Date();
      const previewText = text.substring(0, 20) + (text.length > 20 ? '...' : '');
      const newHistoryItem = {
        id: Date.now(),
        timestamp,
        voice: selectedVoice,
        text,
        previewText,
        audioUrl: url
      };
      
      const newHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(newHistory);
      saveHistory(newHistory);
      
      toast({
        title: "语音生成成功！",
        description: "您可以播放或下载生成的音频",
      });
    } catch (error) {
      toast({
        title: "语音生成失败",
        description: "请稍后重试或联系客服",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAudio = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `nexus_voice_${new Date().getTime()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('nexusAudioGeneratorHistory', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }
  };

  const loadHistory = () => {
    try {
      const historyData = localStorage.getItem('nexusAudioGeneratorHistory');
      if (historyData) {
        const parsedHistory = JSON.parse(historyData);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (e) {
      console.error('Error loading history from localStorage:', e);
    }
  };

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？这个操作不可撤销。')) {
      setHistory([]);
      localStorage.removeItem('nexusAudioGeneratorHistory');
      toast({
        title: "历史记录已清空",
      });
    }
  };

  const getSelectedVoiceStyle = () => {
    return voiceStyles.find(v => v.id === selectedVoice) || voiceStyles[0];
  };

  return (
    <div className="min-h-screen bg-nexus-dark relative">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-nexus-blue to-nexus-cyan bg-clip-text text-transparent mb-4">
            AI 语音合成
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto">
            输入文本，选择语音风格，一键将文字转换为自然流畅的语音。
            支持多种声音特征，帮您创建专业水准的音频内容。
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Area */}
          <div>
            <Card className="bg-nexus-dark/70 border-nexus-blue/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center mb-3">
                    <Volume2 className="mr-2 h-5 w-5 text-nexus-blue" />
                    选择语音风格
                  </h2>
                  <p className="text-sm text-white/60 mb-4">每种风格都有其独特的音色和表现力，选择最适合您内容的声音</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {voiceStyles.map(voice => (
                      <div 
                        key={voice.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedVoice === voice.id 
                            ? 'border-nexus-blue/50 bg-nexus-blue/10' 
                            : 'border-nexus-blue/10 bg-nexus-dark/40 hover:bg-nexus-dark/60'
                        }`}
                        onClick={() => setSelectedVoice(voice.id)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-8 h-8 ${voice.color} rounded-full flex items-center justify-center mb-2`}>
                            <Volume2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-white font-medium text-sm">{voice.name}</div>
                          <div className="text-white/60 text-xs">{voice.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white flex items-center mb-3">
                    <FileText className="mr-2 h-5 w-5 text-nexus-blue" />
                    输入文本
                  </h2>
                  
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入要转换为语音的文本。如需让AI照着念，可以在文本之前加上：请照着文本念"
                    className="h-40 bg-nexus-dark/30 border-nexus-blue/20 focus:border-nexus-blue/50 text-white"
                  />
                  
                  <div className="flex items-center mt-2 text-sm text-white/60">
                    <div className="flex items-center mr-4">
                      <FileText className="mr-1 h-4 w-4" />
                      <span>字符数: {charCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>估计时长: {estimatedDuration}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={generateAudio}
                  disabled={isGenerating} 
                  className="w-full bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      生成语音
                    </>
                  )}
                </Button>
                
                <div className="mt-6 bg-nexus-blue/5 border border-nexus-blue/20 rounded-lg p-4">
                  <div className="flex items-center text-white/90 mb-2">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                    <h3 className="font-medium">使用小技巧</h3>
                  </div>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• 输入标点符号可增加语音的自然停顿和语调变化</li>
                    <li>• 不同语音风格适合不同场景，可以尝试多种风格找到最适合的</li>
                    <li>• 大段文本可划分为多个段落，生成后再合并，效果更佳</li>
                    <li>• 特殊专业术语可能需要加注音或替换为更通用的表达</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Preview & History */}
          <div className="space-y-6">
            {/* Audio Preview */}
            <Card className="bg-nexus-dark/70 border-nexus-blue/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <Music className="mr-2 h-5 w-5 text-nexus-blue" />
                    音频预览
                  </h2>
                </div>
                
                {selectedVoice && (
                  <div className="bg-nexus-dark/40 rounded-lg p-3 mb-4 flex items-center">
                    <div className={`w-10 h-10 ${getSelectedVoiceStyle().color} rounded-full flex items-center justify-center mr-3`}>
                      <Volume2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{getSelectedVoiceStyle().name}</div>
                      <div className="text-white/60 text-sm">{getSelectedVoiceStyle().description}</div>
                    </div>
                  </div>
                )}
                
                <div className="bg-nexus-dark/30 border border-nexus-blue/10 rounded-lg p-6 min-h-[200px] flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center text-white/60">
                      <Loader2 className="h-10 w-10 mb-4 mx-auto animate-spin text-nexus-blue" />
                      <p>正在生成语音...</p>
                    </div>
                  ) : audioSrc ? (
                    <div className="w-full">
                      <audio ref={audioRef} src={audioSrc} controls className="w-full" />
                      <Button 
                        onClick={() => downloadAudio(audioSrc, `nexus_${selectedVoice}_${new Date().getTime()}.mp3`)}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载音频文件
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-white/60">
                      <Music className="h-12 w-12 mb-4 mx-auto opacity-40" />
                      <p>尚未生成语音</p>
                      <p className="text-sm mt-1">请输入文本并点击生成按钮</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* History */}
            <Card className="bg-nexus-dark/70 border-nexus-blue/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <History className="mr-2 h-5 w-5 text-nexus-blue" />
                    历史记录
                  </h2>
                  {history.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={clearHistory}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      清空记录
                    </Button>
                  )}
                </div>
                
                {history.length > 0 ? (
                  <div>
                    <div className="mb-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-amber-200">生成记录链接刷新后重置，请注意下载重要音频</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {history.map(item => (
                        <div 
                          key={item.id}
                          className="p-3 bg-nexus-dark/40 border border-nexus-blue/10 rounded-lg hover:bg-nexus-dark/60 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs text-white/50 mb-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </div>
                              <div className="font-medium text-nexus-blue mb-1">
                                {voiceStyles.find(v => v.id === item.voice)?.name || item.voice}
                              </div>
                              <div className="text-sm text-white/80 truncate max-w-[300px]">
                                {item.previewText}
                              </div>
                            </div>
                            {item.audioUrl && (
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-nexus-blue/30 bg-transparent"
                                onClick={() => downloadAudio(item.audioUrl!, `nexus_${item.voice}_${new Date(item.timestamp).getTime()}.mp3`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <History className="h-12 w-12 mb-3 mx-auto opacity-30" />
                    <p>暂无历史记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Voice;
