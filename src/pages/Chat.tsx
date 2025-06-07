
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Mic, 
  MicOff, 
  MessageCircle, 
  Image as ImageIcon, 
  Volume2, 
  Bot,
  User,
  Loader2,
  Settings
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import PaymentCheck from '@/components/PaymentCheck';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'image';
  imageUrl?: string;
}

const AI_MODELS = [
  { id: "openai", name: "OpenAI GPT-4o-mini", group: "OpenAI" },
  { id: "openai-large", name: "OpenAI GPT-4o", group: "OpenAI" },
  { id: "claude", name: "Claude 3.5 Haiku", group: "Anthropic" },
  { id: "gemini", name: "Gemini 2.0 Flash", group: "Google" },
  { id: "searchgpt", name: "SearchGPT", group: "OpenAI" },
  { id: "deepseek", name: "DeepSeek-V3", group: "DeepSeek" },
  { id: "llama", name: "Llama 3.3 70B", group: "Meta" },
];

interface ChatProps {
  decrementUsage?: () => boolean;
}

const Chat = ({ decrementUsage }: ChatProps) => {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [imageMessages, setImageMessages] = useState<Message[]>([]);
  const [audioMessages, setAudioMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentModel, setCurrentModel] = useState('gemini');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, imageMessages, audioMessages]);

  // 初始化语音识别
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'zh-CN';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsRecording(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('语音识别错误:', event.error);
          setIsRecording(false);
          toast({
            title: "语音识别失败",
            description: "请检查麦克风权限或稍后重试",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [toast]);

  // 智能提示词优化器
  const enhancePromptIntelligently = (originalPrompt: string): string => {
    if (!originalPrompt.trim()) return originalPrompt;

    let enhanced = originalPrompt;

    // 检测风格意图 - 优先检查艺术风格关键词
    const isArtStyle = /艺术|绘画|插画|动漫|卡通|手绘|art|painting|illustration|drawing|anime|cartoon|sketch|digital art|concept art|artwork/i.test(originalPrompt);
    const isRealisticStyle = /真实|现实|照片|摄影|realistic|real|photo|photography|photorealistic/i.test(originalPrompt);
    const isFantasyStyle = /幻想|魔法|科幻|梦幻|fantasy|magic|sci-fi|surreal|dreamy|mystical/i.test(originalPrompt);
    const is3DStyle = /3d|三维|建模|渲染|blender|cinema4d|3d render|3d model/i.test(originalPrompt);

    // 检测人物相关
    if (/人|女|男|girl|boy|woman|man|person|people|character/i.test(originalPrompt)) {
      if (isArtStyle) {
        enhanced += ', beautiful character design, expressive eyes, detailed facial features, digital art style, professional illustration, sharp details';
      } else if (isFantasyStyle) {
        enhanced += ', fantasy character, magical appearance, ethereal beauty, enchanted features, mystical atmosphere';
      } else if (!isRealisticStyle) {
        enhanced += ', detailed portrait, beautiful facial features, expressive eyes, professional artwork, high quality rendering';
      } else {
        enhanced += ', highly detailed portrait, beautiful facial features, expressive eyes, perfect skin texture, professional portrait photography, studio lighting, sharp focus on face, realistic hair texture, natural expression, high resolution';
      }
    }

    // 检测动物相关
    if (/猫|狗|鸟|动物|cat|dog|bird|animal|pet/i.test(originalPrompt)) {
      if (isArtStyle) {
        enhanced += ', cute animal illustration, artistic style, detailed fur/feather texture, expressive animal eyes, digital art';
      } else if (isFantasyStyle) {
        enhanced += ', magical creature, fantasy animal, mystical features, enchanted appearance';
      } else if (!isRealisticStyle) {
        enhanced += ', detailed animal art, natural features, high quality illustration';
      } else {
        enhanced += ', highly detailed animal photography, natural fur/feather texture, expressive animal eyes, wildlife photography style, natural habitat, professional animal portrait, sharp details, realistic lighting';
      }
    }

    // 检测风景相关
    if (/风景|山|海|天空|森林|landscape|mountain|sea|sky|forest|nature/i.test(originalPrompt)) {
      if (isArtStyle) {
        enhanced += ', artistic landscape, painted style, beautiful scenery, digital landscape art, artistic composition';
      } else if (isFantasyStyle) {
        enhanced += ', fantasy landscape, magical scenery, enchanted environment, mystical atmosphere, otherworldly beauty';
      } else if (!isRealisticStyle) {
        enhanced += ', beautiful landscape art, scenic view, detailed environment, artistic rendering';
      } else {
        enhanced += ', breathtaking landscape photography, dramatic sky, golden hour lighting, wide angle view, high dynamic range, vivid natural colors, professional landscape photography, stunning vista, detailed foreground and background';
      }
    }

    // 检测建筑相关
    if (/建筑|房子|城市|building|house|city|architecture|tower/i.test(originalPrompt)) {
      if (isArtStyle) {
        enhanced += ', architectural art, artistic building design, illustrated architecture, concept art style';
      } else if (isFantasyStyle) {
        enhanced += ', fantasy architecture, magical buildings, enchanted structures, mystical design';
      } else if (is3DStyle) {
        enhanced += ', 3d architectural visualization, detailed 3d model, professional rendering, clean topology';
      } else if (!isRealisticStyle) {
        enhanced += ', detailed architectural design, beautiful building structure, artistic composition';
      } else {
        enhanced += ', architectural photography, detailed building structure, modern/classic design elements, professional architectural shot, perfect perspective, sharp geometric lines, urban photography style, detailed facade';
      }
    }

    // 根据检测到的风格添加对应的质量增强词
    if (isArtStyle) {
      enhanced += ', digital art masterpiece, highly detailed illustration, vibrant color palette, artistic composition, professional digital painting, creative artwork, trending on artstation, award winning art';
    } else if (isFantasyStyle) {
      enhanced += ', fantasy art, magical atmosphere, enchanted scene, mystical lighting, otherworldly beauty, fantasy masterpiece, detailed fantasy illustration';
    } else if (is3DStyle) {
      enhanced += ', high quality 3d render, detailed 3d model, professional 3d visualization, clean topology, perfect lighting, 3d masterpiece';
    } else if (isRealisticStyle || (!isArtStyle && !isFantasyStyle && !is3DStyle)) {
      // 只有在明确要求真实风格或没有其他风格指示时才添加真实照片相关词汇
      if (isRealisticStyle) {
        enhanced += ', masterpiece, best quality, ultra detailed, 8k resolution, photorealistic, professional photography, sharp focus, perfect lighting, vivid colors, highly detailed, award winning photo';
      } else {
        enhanced += ', masterpiece, best quality, ultra detailed, high resolution, sharp focus, perfect composition, vivid colors, highly detailed';
      }
    }

    // 检测科幻/未来主题（保持原有逻辑）
    if (/科幻|未来|机器人|太空|sci-fi|future|robot|space|cyberpunk/i.test(originalPrompt)) {
      enhanced += ', futuristic design, advanced technology, high-tech details, science fiction concept art, detailed mechanical parts, glowing elements';
      if (!isArtStyle && !isRealisticStyle) {
        enhanced += ', digital art';
      }
    }

    return enhanced;
  };

  // 生成随机艺术提示词
  const generateRandomPrompt = () => {
    const artisticPrompts = [
      "A beautiful anime girl with flowing hair in a magical forest, digital art style, by Makoto Shinkai",
      "A majestic dragon soaring over ancient mountains, fantasy art, epic composition, by Greg Rutkowski",
      "A cyberpunk cityscape at night, neon lights, futuristic architecture, digital art masterpiece",
      "A serene oriental garden with cherry blossoms, traditional art style, painted illustration",
      "A mystical wizard casting spells in a starry night, fantasy character art, magical atmosphere",
      "A steampunk airship floating in cloudy skies, Victorian-era fantasy, detailed mechanical design",
      "A graceful dancer in flowing silk dress, art nouveau style, elegant composition, by Alphonse Mucha",
      "A fierce warrior with ornate armor, epic fantasy art, dynamic pose, detailed illustration"
    ];
    
    const randomPrompt = artisticPrompts[Math.floor(Math.random() * artisticPrompts.length)];
    setInputValue(randomPrompt);
    
    toast({
      title: "随机艺术提示词已生成",
      description: "已为您生成一个具有艺术感的提示词",
    });
  };

  // 处理语音录制
  const handleVoiceRecord = () => {
    if (!recognitionRef.current) {
      toast({
        title: "不支持语音识别",
        description: "请使用Chrome浏览器或检查麦克风权限",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // 调用真实的Pollinations.ai API
  const callTextAPI = async (prompt: string, modelId: string) => {
    try {
      setIsTyping(true);
      
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
      
      console.log('调用API:', apiUrl);
      console.log('模型:', modelId);
      console.log('提示词:', prompt);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status}`);
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      // 创建AI消息占位符
      const aiMessageId = Date.now().toString();
      const getCurrentMessages = () => {
        switch (activeTab) {
          case 'image': return imageMessages;
          case 'audio': return audioMessages;
          default: return chatMessages;
        }
      };
      
      const setCurrentMessages = (updater: (prev: Message[]) => Message[]) => {
        switch (activeTab) {
          case 'image': setImageMessages(updater); break;
          case 'audio': setAudioMessages(updater); break;
          default: setChatMessages(updater); break;
        }
      };
      
      // 添加AI消息占位符
      setCurrentMessages(prev => [...prev, {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
        
        // 更新AI消息内容
        setCurrentMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: aiResponse }
            : msg
        ));
      }
      
      return aiResponse;
    } catch (error) {
      console.error("API调用错误:", error);
      toast({
        title: "模型调用失败",
        description: "请稍后再试",
        variant: "destructive",
      });
      return "抱歉，我在处理您的请求时遇到了问题。请稍后再试。";
    } finally {
      setIsTyping(false);
    }
  };

  // 生成图片
  const generateImage = async (prompt: string) => {
    try {
      setIsTyping(true);
      
      // 智能优化提示词
      const enhancedPrompt = enhancePromptIntelligently(prompt);
      console.log('原始提示词:', prompt);
      console.log('优化后提示词:', enhancedPrompt);
      
      const timestamp = Date.now();
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=768&seed=${timestamp}&nologo=true&enhance=true&model=flux`;
      
      // 创建图片消息
      const imageMessage: Message = {
        id: timestamp.toString(),
        text: prompt,
        sender: 'ai',
        timestamp: new Date(),
        type: 'image',
        imageUrl: apiUrl
      };
      
      setImageMessages(prev => [...prev, imageMessage]);
      
      toast({
        title: "图像生成成功",
        description: "您的AI图像已生成",
      });
    } catch (error) {
      console.error('生成图像时出错:', error);
      toast({
        title: "生成失败",
        description: "图像生成失败，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // 语音合成
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (decrementUsage && !decrementUsage()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // 根据当前标签页添加到对应消息列表
    switch (activeTab) {
      case 'image':
        setImageMessages(prev => [...prev, userMessage]);
        await generateImage(inputValue);
        break;
      case 'audio':
        setAudioMessages(prev => [...prev, userMessage]);
        const audioResponse = await callTextAPI(inputValue, currentModel);
        if (voiceReplyEnabled && audioResponse) {
          speakText(audioResponse);
        }
        break;
      default:
        setChatMessages(prev => [...prev, userMessage]);
        const textResponse = await callTextAPI(inputValue, currentModel);
        if (voiceReplyEnabled && textResponse) {
          speakText(textResponse);
        }
        break;
    }

    setInputValue('');
  };

  // 处理快捷问题
  const handleQuickQuestion = async (question: string) => {
    setInputValue(question);
    // 自动发送
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 获取当前消息列表
  const getCurrentMessages = () => {
    switch (activeTab) {
      case 'image': return imageMessages;
      case 'audio': return audioMessages;
      default: return chatMessages;
    }
  };

  // 快捷问题
  const quickQuestions = [
    "帮我写一篇关于AI技术的文章",
    "生成一个创意广告文案",
    "画一只在宇宙中漂浮的可爱猫咪",
    "创作一首关于春天的诗",
    "制作一个科幻风格的城市场景"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col">
      <Navigation />
      
      <PaymentCheck featureType="chat">
        <main className="flex-grow flex flex-col pt-16">
          <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col p-4">
            {/* 标签页切换 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-grow flex flex-col">
              <div className="flex justify-center mb-6">
                <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
                  <TabsTrigger 
                    value="chat" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    聊天
                  </TabsTrigger>
                  <TabsTrigger 
                    value="image" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    图像
                  </TabsTrigger>
                  <TabsTrigger 
                    value="audio" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    音频
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 聊天内容区域 */}
              <div className="flex-grow flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <TabsContent value="chat" className="flex-grow flex flex-col m-0">
                  {chatMessages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-8">
                      <div className="text-center mb-8">
                        <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">欢迎来到 Nexus AI！</h2>
                        <p className="text-white/70 mb-8">我可以帮助您进行智能对话，您今天想聊什么？</p>
                      </div>
                      
                      <div className="h-32"></div>
                      
                      <div className="w-full max-w-2xl">
                        <p className="text-white/60 text-center mb-4">请尝试以下方法之一：</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {quickQuestions.slice(0, 4).map((question, index) => (
                            <Card 
                              key={index}
                              className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                              onClick={() => handleQuickQuestion(question)}
                            >
                              <CardContent className="p-4">
                                <p className="text-white/90 text-sm">{question}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.sender === 'ai' && <Bot className="h-5 w-5 mt-0.5 text-blue-400" />}
                              {message.sender === 'user' && <User className="h-5 w-5 mt-0.5" />}
                              <div className="flex-1">
                                <p className="whitespace-pre-wrap">{message.text}</p>
                                <p className="text-xs opacity-70 mt-2">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <Bot className="h-5 w-5 text-blue-400" />
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span className="text-white/70">AI正在思考...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="image" className="flex-grow flex flex-col m-0">
                  {imageMessages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-8">
                      <div className="text-center mb-8">
                        <ImageIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">AI 图像生成</h2>
                        <p className="text-white/70 mb-8">描述您想要生成的图像，AI将为您创作精美的艺术作品</p>
                      </div>
                      
                      <div className="h-32"></div>
                      
                      <div className="w-full max-w-2xl">
                        <p className="text-white/60 text-center mb-4">请尝试以下方法之一：</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("画一只在魔法森林中的可爱独角兽")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">画一只在魔法森林中的可爱独角兽</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("生成一座未来主义风格的城市")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">生成一座未来主义风格的城市</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={generateRandomPrompt}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">🎲 随机艺术提示词</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("创作一幅抽象艺术作品")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">创作一幅抽象艺术作品</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                      {imageMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                            }`}
                          >
                            {message.type === 'image' && message.imageUrl ? (
                              <div>
                                <img 
                                  src={message.imageUrl} 
                                  alt={message.text}
                                  className="rounded-lg max-w-full h-auto mb-2"
                                />
                                <p className="text-sm opacity-90">提示词: {message.text}</p>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{message.text}</p>
                            )}
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="h-5 w-5 text-purple-400" />
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span className="text-white/70">正在生成图像...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="audio" className="flex-grow flex flex-col m-0">
                  {audioMessages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center p-8">
                      <div className="text-center mb-8">
                        <Volume2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">语音聊天</h2>
                        <p className="text-white/70 mb-8">与AI进行语音对话，支持语音输入和语音回复</p>
                      </div>
                      
                      <div className="h-32"></div>
                      
                      <div className="w-full max-w-2xl">
                        <p className="text-white/60 text-center mb-4">请尝试以下方法之一：</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("介绍一下人工智能的发展历程")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">介绍一下人工智能的发展历程</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("讲一个有趣的科学故事")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">讲一个有趣的科学故事</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("教我一些实用的生活技巧")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">教我一些实用的生活技巧</p>
                            </CardContent>
                          </Card>
                          <Card 
                            className="bg-white/10 backdrop-blur-sm border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-200"
                            onClick={() => handleQuickQuestion("分析一下当前的科技趋势")}
                          >
                            <CardContent className="p-4">
                              <p className="text-white/90 text-sm">分析一下当前的科技趋势</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                      {audioMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.sender === 'ai' && <Volume2 className="h-5 w-5 mt-0.5 text-green-400" />}
                              {message.sender === 'user' && <User className="h-5 w-5 mt-0.5" />}
                              <div className="flex-1">
                                <p className="whitespace-pre-wrap">{message.text}</p>
                                <p className="text-xs opacity-70 mt-2">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <Volume2 className="h-5 w-5 text-green-400" />
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                              <span className="text-white/70">AI正在回复...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </TabsContent>

                {/* 输入区域 */}
                <div className="p-6 border-t border-white/10">
                  {/* 模型选择和语音回复开关 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/60 text-sm">模型:</span>
                        <Select value={currentModel} onValueChange={setCurrentModel}>
                          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {AI_MODELS.map((model) => (
                              <SelectItem 
                                key={model.id} 
                                value={model.id}
                                className="text-white hover:bg-slate-700"
                              >
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(activeTab === 'audio' || activeTab === 'chat') && (
                        <div className="flex items-center space-x-2">
                          <span className="text-white/60 text-sm">语音回复:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
                            className={`${
                              voiceReplyEnabled 
                                ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                                : 'bg-white/10 border-white/20 text-white/70'
                            } text-xs`}
                          >
                            {voiceReplyEnabled ? '已开启' : '已关闭'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 输入框 */}
                  <div className="flex items-end space-x-4">
                    <div className="flex-grow">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          activeTab === 'image' 
                            ? "描述您想要生成的图像..." 
                            : activeTab === 'audio'
                            ? "输入文字或点击麦克风语音输入..."
                            : "输入您的消息..."
                        }
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400 min-h-[50px]"
                        disabled={isTyping}
                      />
                    </div>
                    
                    {/* 语音输入按钮 */}
                    {(activeTab === 'audio' || activeTab === 'chat') && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleVoiceRecord}
                        disabled={isTyping}
                        className={`${
                          isRecording 
                            ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                            : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                        } h-[50px] w-[50px]`}
                      >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    )}

                    {/* 发送按钮 */}
                    <Button
                      onClick={sendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-[50px] px-6 disabled:opacity-50"
                    >
                      {isTyping ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Chat;
