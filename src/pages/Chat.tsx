
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, MessageSquare, Image as ImageIcon, Mic, Upload, Sparkles, Download, MicIcon, Play, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  type?: 'text' | 'image' | 'voice';
}

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // AI模型列表
  const models = [
    { id: 'openai', name: 'GPT-4o-mini', description: 'OpenAI高效模型' },
    { id: 'openai-large', name: 'GPT-4o', description: 'OpenAI旗舰模型' },
    { id: 'openai-reasoning', name: 'o1-mini', description: 'OpenAI推理模型' },
    { id: 'llama', name: 'Llama 3.3 70B', description: 'Meta最新大模型' },
    { id: 'mistral', name: 'Mistral Nemo', description: 'Mistral高效模型' },
    { id: 'deepseek', name: 'DeepSeek-V3', description: 'DeepSeek旗舰模型' },
    { id: 'deepseek-r1', name: 'DeepSeek-R1', description: 'DeepSeek推理模型' },
    { id: 'claude', name: 'Claude 3.5 Haiku', description: 'Anthropic快速模型' },
    { id: 'gemini', name: 'Gemini 2.0 Flash', description: 'Google最新模型' },
    { id: 'searchgpt', name: 'SearchGPT', description: 'OpenAI搜索模型' },
  ];

  // 语音风格列表
  const voices = [
    { id: 'alloy', name: '合金', style: '中性清晰' },
    { id: 'echo', name: '回波', style: '深沉磁性' },
    { id: 'fable', name: '寓言', style: '温暖友好' },
    { id: 'onyx', name: '缟玛瑙', style: '成熟稳重' },
    { id: 'nova', name: '新星', style: '年轻活力' },
    { id: 'shimmer', name: '微光', style: '轻柔甜美' },
  ];

  const moreVoices = [
    { id: 'coral', name: '珊瑚', style: '清新自然' },
    { id: 'ballad', name: '民谣', style: '抒情柔和' },
    { id: 'verse', name: '诗句', style: '文艺优雅' },
    { id: 'sage', name: '圣人', style: '智慧沉稳' },
    { id: 'aster', name: '紫菀', style: '神秘优美' },
    { id: 'brook', name: '小溪', style: '流畅自然' },
  ];

  // 建议提示词
  const suggestedPrompts = [
    "创建一个未来主义的智能城市设计方案",
    "描述一下人工智能在医疗领域的应用前景", 
    "生成一个关于环保主题的创意文案",
    "解释量子计算的基本原理",
    "设计一个适合远程办公的工作流程"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初始化语音识别
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setInputValue(result);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
        toast({
          title: "语音识别失败",
          description: "请检查麦克风权限或重试",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const callPollinationsAPI = async (prompt: string, modelId: string) => {
    try {
      console.log(`正在调用模型: ${modelId}, 提示词: ${prompt}`);
      
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
      
      console.log(`API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log(`API响应: ${responseText}`);
      
      return responseText || '抱歉，模型没有返回有效响应。';
      
    } catch (error) {
      console.error('API调用错误:', error);
      throw error;
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      setIsGeneratingImage(true);
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
      
      return imageUrl;
    } catch (error) {
      console.error('图片生成错误:', error);
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const isImageRequest = (text: string) => {
    const imageKeywords = ['画', '绘制', '生成图片', '创作', '画一个', '画一张', '图片', '插画', 'draw', 'paint', 'create image', 'generate image'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const handleSendMessage = async (customPrompt?: string, customModel?: string) => {
    const messageText = customPrompt || inputValue.trim();
    const currentModel = customModel || selectedModel;
    
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      if (isImageRequest(messageText) || activeTab === 'image') {
        setIsGeneratingImage(true);
        const imageUrl = await generateImage(messageText);
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: `我为您生成了这张图片：`,
          isUser: false,
          timestamp: new Date(),
          imageUrl: imageUrl,
          type: 'image'
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setIsTyping(false);
      } else {
        const aiResponseText = await callPollinationsAPI(messageText, currentModel);
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: aiResponseText,
          isUser: false,
          timestamp: new Date(),
          type: 'text'
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setIsTyping(false);
      }
      
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsTyping(false);
      setIsGeneratingImage(false);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '抱歉，AI服务暂时不可用，请稍后再试。',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      toast({
        title: "发送失败",
        description: "AI服务暂时不可用，请稍后再试",
        variant: "destructive",
      });
    }
  };

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) return;
    await handleSendMessage(imagePrompt);
    setImagePrompt('');
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "不支持语音识别",
        description: "您的浏览器不支持语音识别功能，请使用Chrome浏览器",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const generateVoice = async (text: string) => {
    try {
      const voiceUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${selectedVoice}`;
      
      // 创建音频元素并播放
      const audio = new Audio(voiceUrl);
      audio.play();
      
      toast({
        title: "语音生成成功",
        description: "正在播放语音",
      });
    } catch (error) {
      console.error('语音生成错误:', error);
      toast({
        title: "语音生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const playVoicePreview = (voiceId: string) => {
    const previewText = "你好，这是" + voices.find(v => v.id === voiceId)?.name + "的语音效果";
    generateVoice(previewText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === 'chat') {
        handleSendMessage();
      } else if (activeTab === 'image') {
        handleImageGenerate();
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* 星空背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900/50 to-purple-900/20 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] z-0"></div>
      
      <Navigation />
      
      <main className="flex-grow flex flex-col pt-16 relative z-10 max-w-6xl mx-auto w-full px-4">
        
        {/* 顶部功能切换和模型选择 */}
        <div className="flex flex-col items-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
            <div className="flex flex-col items-center">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-800/50 border border-slate-700 mb-6">
                <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  聊天
                </TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  图像
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <Volume2 className="h-4 w-4 mr-2" />
                  语音
                </TabsTrigger>
              </TabsList>

              {/* 模型选择 - 小字体左对齐 */}
              <div className="w-full mb-4">
                <div className="flex items-center text-sm text-slate-400 mb-2">
                  <span className="mr-2">模型：</span>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-transparent border-slate-700 text-white w-48 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="text-white hover:bg-slate-700">
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <TabsContent value="chat" className="flex-grow flex flex-col">
              {/* 聊天内容区域 */}
              {messages.length === 0 ? (
                <div className="flex-grow flex flex-col justify-center items-center">
                  <div className="text-center mb-16">
                    <h1 className="text-2xl font-medium text-slate-300 mb-16">
                      欢迎来到 Nexus AI！我可以帮助您生成文本、图像等，您今天想创造什么？
                    </h1>
                    
                    {/* 增加更大的空白间距 - 8行高度 */}
                    <div className="h-32 mb-8"></div>
                    
                    <p className="text-slate-400 text-center mb-8">请尝试以下方法之一：</p>
                  </div>
                  
                  {/* 建议问题 */}
                  <div className="max-w-4xl w-full">
                    <div className="flex flex-wrap justify-center gap-3">
                      {suggestedPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          onClick={() => handleSendMessage(prompt)}
                          variant="outline"
                          className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 text-sm px-4 py-2 h-auto whitespace-normal max-w-xs"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6 overflow-hidden flex flex-col min-h-[500px]">
                  <div className="flex-grow overflow-y-auto space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl p-4 ${
                          message.isUser 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-slate-800/70 border border-slate-700 text-white'
                        }`}>
                          <div className="flex items-start space-x-3">
                            {!message.isUser && <Bot className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />}
                            <div className="flex-grow">
                              <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                              {message.imageUrl && (
                                <div className="mt-3">
                                  <img 
                                    src={message.imageUrl} 
                                    alt="AI生成的图片" 
                                    className="max-w-full h-auto rounded-lg border border-slate-600"
                                    onLoad={() => scrollToBottom()}
                                  />
                                </div>
                              )}
                              <p className="text-xs opacity-70 mt-2">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                            {message.isUser && <User className="h-5 w-5 text-white mt-1 flex-shrink-0" />}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(isTyping || isGeneratingImage) && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 max-w-[80%]">
                          <div className="flex items-center space-x-3">
                            <Bot className="h-5 w-5 text-purple-400" />
                            <div className="flex items-center space-x-2">
                              {isGeneratingImage && <ImageIcon className="h-4 w-4 text-purple-400" />}
                              <span className="text-slate-300 text-sm">
                                {isGeneratingImage ? '正在生成图片...' : '正在思考...'}
                              </span>
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="image" className="flex-grow flex flex-col">
              <div className="flex-grow bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6 overflow-hidden flex flex-col min-h-[500px]">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-medium text-slate-300 mb-4">
                    AI 图像生成
                  </h1>
                  <p className="text-slate-400">描述您想要的图像，AI将为您创作</p>
                </div>
                
                {/* 显示生成的图片消息 */}
                <div className="flex-grow overflow-y-auto space-y-6">
                  {messages.filter(msg => msg.type === 'image').map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl p-4 ${
                        message.isUser 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-slate-800/70 border border-slate-700 text-white'
                      }`}>
                        <div className="flex items-start space-x-3">
                          {!message.isUser && <Bot className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />}
                          <div className="flex-grow">
                            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                            {message.imageUrl && (
                              <div className="mt-3">
                                <img 
                                  src={message.imageUrl} 
                                  alt="AI生成的图片" 
                                  className="max-w-full h-auto rounded-lg border border-slate-600"
                                />
                              </div>
                            )}
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          {message.isUser && <User className="h-5 w-5 text-white mt-1 flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isGeneratingImage && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 max-w-[80%]">
                        <div className="flex items-center space-x-3">
                          <Bot className="h-5 w-5 text-purple-400" />
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-purple-400" />
                            <span className="text-slate-300 text-sm">正在生成图片...</span>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="flex-grow flex flex-col">
              <div className="flex-grow bg-slate-900/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 mb-6 overflow-hidden flex flex-col min-h-[500px]">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-medium text-slate-300 mb-4">
                    AI 语音合成
                  </h1>
                  <p className="text-slate-400">输入文本，选择语音风格，生成语音</p>
                </div>
                
                {/* 语音风格选择 */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-4">常用语音风格</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {voices.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedVoice === voice.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                        }`}
                        onClick={() => setSelectedVoice(voice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{voice.name}</p>
                            <p className="text-slate-400 text-sm">{voice.style}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoicePreview(voice.id);
                            }}
                            className="text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            试听
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <details className="group">
                    <summary className="text-purple-400 cursor-pointer hover:text-purple-300 mb-4">
                      更多语音风格 ▼
                    </summary>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {moreVoices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedVoice === voice.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-slate-600 bg-slate-800/50 hover:bg-slate-700/50'
                          }`}
                          onClick={() => setSelectedVoice(voice.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{voice.name}</p>
                              <p className="text-slate-400 text-sm">{voice.style}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                playVoicePreview(voice.id);
                              }}
                              className="text-xs"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              试听
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
                
                {/* 文本输入区域 */}
                <div className="flex-grow">
                  <Textarea
                    placeholder="输入要转换为语音的文本..."
                    className="w-full h-32 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 resize-none"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                
                {/* 语音操作按钮 */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    onClick={() => generateVoice(inputValue)}
                    disabled={!inputValue.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    生成语音
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 底部输入区域 - 根据不同tab显示不同内容 */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-4">
              {activeTab === 'chat' && (
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-700 text-slate-400 hover:bg-slate-700 flex-shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的问题..."
                    className="flex-grow bg-transparent border-slate-700 text-white placeholder-slate-400"
                    disabled={isTyping || isGeneratingImage}
                  />
                  <Button
                    onClick={handleVoiceInput}
                    variant="outline"
                    size="icon"
                    className={`border-slate-700 flex-shrink-0 ${
                      isListening 
                        ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                        : 'text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping || isGeneratingImage}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                  >
                    {(isTyping || isGeneratingImage) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              
              {activeTab === 'image' && (
                <div className="flex space-x-3">
                  <Input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="描述您想要生成的图像..."
                    className="flex-grow bg-transparent border-slate-700 text-white placeholder-slate-400"
                    disabled={isGeneratingImage}
                  />
                  <Button 
                    onClick={handleImageGenerate}
                    disabled={!imagePrompt.trim() || isGeneratingImage}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                  >
                    {isGeneratingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              
              {activeTab === 'voice' && (
                <div className="text-center text-slate-400">
                  在上方输入文本，选择语音风格，然后点击生成语音
                </div>
              )}
            </div>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
