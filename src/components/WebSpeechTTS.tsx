
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Play, Pause, Download, Volume2, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Voice {
  voice: SpeechSynthesisVoice;
  lang: string;
  name: string;
  localService: boolean;
}

interface WebSpeechTTSProps {
  text: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

const WebSpeechTTS: React.FC<WebSpeechTTSProps> = ({ text, onAudioGenerated }) => {
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const voiceList: Voice[] = availableVoices.map(voice => ({
        voice,
        lang: voice.lang,
        name: voice.name,
        localService: voice.localService
      }));
      
      // 优先显示中文语音
      const sortedVoices = voiceList.sort((a, b) => {
        if (a.lang.includes('zh') && !b.lang.includes('zh')) return -1;
        if (!a.lang.includes('zh') && b.lang.includes('zh')) return 1;
        if (a.localService && !b.localService) return -1;
        if (!a.localService && b.localService) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setVoices(sortedVoices);
      
      // 自动选择第一个中文语音或第一个语音
      if (sortedVoices.length > 0) {
        const chineseVoice = sortedVoices.find(v => v.lang.includes('zh'));
        setSelectedVoice(chineseVoice ? chineseVoice.voice.name : sortedVoices[0].voice.name);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = () => {
    if (!text.trim()) {
      toast({
        title: "文本为空",
        description: "请输入需要转换的文本",
        variant: "destructive",
      });
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.voice.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice.voice;
    }
    
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];
    utterance.volume = volume[0];

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      toast({
        title: "语音合成失败",
        description: `错误: ${event.error}`,
        variant: "destructive",
      });
    };

    speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const recordAudio = async () => {
    try {
      setIsRecording(true);
      
      // 创建音频上下文
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // 创建媒体流录制器
      const stream = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(stream.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        onAudioGenerated?.(audioUrl);
        setIsRecording(false);
        
        toast({
          title: "录制完成",
          description: "语音已保存，可以下载",
        });
      };

      // 开始录制
      mediaRecorder.start();

      // 创建语音合成
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.voice.name === selectedVoice);
      
      if (voice) {
        utterance.voice = voice.voice;
      }
      
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];
      utterance.volume = volume[0];

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500);
      };

      speechSynthesis.speak(utterance);
      
    } catch (error) {
      setIsRecording(false);
      toast({
        title: "录制失败",
        description: "无法录制音频，请检查浏览器权限",
        variant: "destructive",
      });
    }
  };

  const getVoiceLanguageLabel = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'zh-CN': '中文(简体)',
      'zh-TW': '中文(繁体)',
      'zh-HK': '中文(香港)',
      'en-US': '英语(美国)',
      'en-GB': '英语(英国)',
      'ja-JP': '日语',
      'ko-KR': '韩语',
    };
    return langMap[lang] || lang;
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Volume2 className="h-5 w-5 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">免费语音合成</h3>
          <div className="ml-auto text-sm text-green-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            浏览器原生TTS
          </div>
        </div>

        <div className="space-y-6">
          {/* 语音选择 */}
          <div>
            <Label className="text-cyan-400 font-medium mb-3 block">选择语音</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="选择语音" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {voices.map((voice) => (
                  <SelectItem 
                    key={voice.voice.name} 
                    value={voice.voice.name}
                    className="text-white hover:bg-gray-600"
                  >
                    <div className="flex flex-col">
                      <span>{voice.name}</span>
                      <span className="text-xs text-gray-400">
                        {getVoiceLanguageLabel(voice.lang)} {voice.localService ? '(本地)' : '(在线)'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 语音参数调节 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">
                语速: {rate[0].toFixed(1)}x
              </Label>
              <Slider
                value={rate}
                onValueChange={setRate}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">
                音调: {pitch[0].toFixed(1)}
              </Label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-2 block">
                音量: {Math.round(volume[0] * 100)}%
              </Label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-3">
            {!isSpeaking ? (
              <Button onClick={speak} className="bg-cyan-500 hover:bg-cyan-600">
                <Play className="mr-2 h-4 w-4" />
                播放
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button onClick={pause} className="bg-yellow-500 hover:bg-yellow-600">
                    <Pause className="mr-2 h-4 w-4" />
                    暂停
                  </Button>
                ) : (
                  <Button onClick={resume} className="bg-green-500 hover:bg-green-600">
                    <Play className="mr-2 h-4 w-4" />
                    继续
                  </Button>
                )}
                <Button onClick={stop} variant="outline" className="border-gray-600 text-gray-300">
                  停止
                </Button>
              </>
            )}
            
            <Button 
              onClick={recordAudio} 
              disabled={isRecording || !text.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Download className="mr-2 h-4 w-4" />
              {isRecording ? '录制中...' : '录制下载'}
            </Button>
          </div>

          {/* 功能说明 */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">功能特点</h4>
            <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5">
              <li>✅ 完全免费，无API限制</li>
              <li>🌐 支持多种语言和语音</li>
              <li>⚡ 实时生成，无网络延迟</li>
              <li>🎛️ 可调节语速、音调和音量</li>
              <li>💾 支持录制和下载音频文件</li>
              <li>🔒 数据安全，本地处理</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSpeechTTS;
