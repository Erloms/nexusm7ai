
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, MessageSquare, Image as ImageIcon, Mic, Upload, Sparkles, Download, MicIcon, Play, Volume2, Settings } from 'lucide-react';
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
  const [enableVoiceReply, setEnableVoiceReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  // 建议提示词
  const suggestedPrompts = [
    "创建一个未来主义的智能城市设计方案",
    "描述一下人工智能在医疗领域的应用前景", 
    "生成一个关于环保主题的创意文案",
    "解释量子计算的基本原理",
    "设计一个适合远程办公的工作流程"
  ];

  // 艺术风格提示词优化器
  const optimizeImagePrompt = (userPrompt: string): string => {
    const styleEnhancers = [
      "masterpiece, best quality, ultra-detailed, 8k, high-resolution",
      "intricate details, stunning composition, cinematic lighting",
      "trending on Artstation, breathtaking, beautiful",
      "dramatic atmosphere, vibrant colors, rich textures",
      "award-winning illustration, highly detailed background"
    ];

    const artisticStyles = [
      "by Greg Rutkowski, Artgerm, WLOP",
      "by Makoto Shinkai, Ilya Kuvshinov", 
      "by Alphonse Mucha, Gustav Klimt",
      "by Beeple, Syd Mead, Simon Stalenhag"
    ];

    // 检测用户提示词是否包含风格关键词
    const hasArtisticTerms = /anime|art|painting|illustration|fantasy|magical|ethereal|dreamy/i.test(userPrompt);
    
    let optimizedPrompt = userPrompt;
    
    if (!hasArtisticTerms) {
      // 如果没有艺术风格，添加艺术增强词
      optimizedPrompt = `A breathtaking artistic illustration of ${userPrompt}, ${styleEnhancers[0]}, ${artisticStyles[Math.floor(Math.random() * artisticStyles.length)]}, ethereal, magical, dreamy atmosphere`;
    } else {
      // 如果已有风格，增强细节
      optimizedPrompt = `${userPrompt}, ${styleEnhancers[Math.floor(Math.random() * styleEnhancers.length)]}, ${artisticStyles[Math.floor(Math.random() * artisticStyles.length)]}`;
    }

    return optimizedPrompt;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初始化语音识别
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.continuous = false;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0].transcript;
        setInputValue(result);
        setIsListening(false);
        
        // 如果启用语音回复，自动发送消息
        if (enableVoiceReply) {
          setTimeout(() => {
            handleSendMessage(result);
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
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
  }, [enableVoiceReply]);

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
      
      // 优化提示词，增强艺术感
      const optimizedPrompt = optimizeImagePrompt(prompt);
      console.log('原始提示词:', prompt);
      console.log('优化后提示词:', optimizedPrompt);
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
      
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

  // 语音回复功能
  const playVoiceReply = async (text: string) => {
    try {
      const voiceUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai-audio&voice=${selectedVoice}`;
      
      const audio = new Audio(voiceUrl);
      audio.play();
      
      console.log('正在播放语音回复');
    } catch (error) {
      console.error('语音回复错误:', error);
    }
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
          text: `我为您生成了这张艺术作品：`,
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
        
        // 如果启用语音回复，播放AI回复
        if (enableVoiceReply && aiResponseText) {
          setTimeout(() => {
            playVoiceReply(aiResponseText);
          }, 500);
        }
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
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
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

              {/* 模型选择和语音设置 - 小字体左对齐 */}
              <div className="w-full mb-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-400">
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
                
                {/* 语音设置 - 小字体选项框 */}
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableVoiceReply}
                        onChange={(e) => setEnableVoiceReply(e.target.checked)}
                        className="w-3 h-3 text-purple-600 rounded"
                      />
                      <span className="text-xs">语音回复</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">语音：</span>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="bg-transparent border-slate-700 text-white w-24 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-slate-700 text-xs">
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="chat" className="flex-grow flex flex-col">
              {/* 聊天内容区域 */}
              {messages.length === 0 ? (
                <div className="flex-grow flex flex-col justify-center items-center">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-medium text-slate-300 mb-8">
                      欢迎来到 Nexus AI！我可以帮助您生成文本、图像等，您今天想创造什么？
                    </h1>
                    
                    {/* 增加空白间距 - 调整为更大的间距 */}
                    <div className="h-24 mb-6"></div>
                    
                    <p className="text-slate-400 text-center mb-6">请尝试以下方法之一：</p>
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
                                    alt="AI生成的艺术作品" 
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
                                {isGeneratingImage ? '正在创作艺术作品...' : '正在思考...'}
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
                    AI 艺术创作
                  </h1>
                  <p className="text-slate-400">描述您想要的艺术作品，AI将为您创作独特的视觉艺术</p>
                  <p className="text-slate-500 text-sm mt-2">✨ 已启用艺术增强模式，自动优化提示词以获得更佳艺术效果</p>
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
                                  alt="AI生成的艺术作品" 
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
                            <span className="text-slate-300 text-sm">正在创作艺术作品...</span>
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
                    语音聊天助手
                  </h1>
                  <p className="text-slate-400">开启语音对话，体验更自然的AI交流方式</p>
                </div>
                
                {/* 语音聊天设置 */}
                <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableVoiceReply}
                        onChange={(e) => setEnableVoiceReply(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-white font-medium">启用语音回复</span>
                    </label>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-sm">语音风格：</span>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {voices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-slate-700">
                              {voice.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-400">
                    {enableVoiceReply ? (
                      <p>✅ 语音聊天已启用：说话→AI理解→AI语音回复</p>
                    ) : (
                      <p>⚪ 仅语音输入：说话→转换为文字→AI文字回复</p>
                    )}
                  </div>
                </div>
                
                {/* 语音聊天区域 */}
                <div className="flex-grow">
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={handleVoiceInput}
                        className={`p-6 rounded-full transition-all duration-200 ${
                          isListening 
                            ? 'bg-red-600 animate-pulse scale-110' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        <Mic className="h-8 w-8 text-white" />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-medium text-white mb-2">
                      {isListening ? '正在听您说话...' : '点击开始语音对话'}
                    </h3>
                    <p className="text-slate-400">
                      {isListening 
                        ? '请说出您的问题' 
                        : enableVoiceReply 
                          ? 'AI将用语音回复您的问题'
                          : '语音将转换为文字显示'
                      }
                    </p>
                  </div>
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
                    placeholder="描述您想要创作的艺术作品..."
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
                  语音聊天模式：点击上方麦克风按钮开始对话
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
