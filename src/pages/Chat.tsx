import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image, Volume2, Mic, MicOff, Send, Copy, Download, Play, Pause, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import PaymentCheck from '@/components/PaymentCheck';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  audioUrl?: string;
}

const AI_MODELS = [
  { id: "gemini", name: "Gemini 2.0 Flash", group: "Google" },
  { id: "openai", name: "OpenAI GPT-4o-mini", group: "OpenAI" },
  { id: "openai-large", name: "OpenAI GPT-4o", group: "OpenAI" },
  { id: "openai-reasoning", name: "OpenAI o1-mini", group: "OpenAI" },
  { id: "llama", name: "Llama 3.3 70B", group: "Meta" },
  { id: "llamalight", name: "Llama 3.1 8B Instruct", group: "Meta" },
  { id: "mistral", name: "Mistral Nemo", group: "Mistral" },
  { id: "deepseek", name: "DeepSeek-V3", group: "DeepSeek" },
  { id: "deepseek-r1", name: "DeepSeek-R1 Distill Qwen 32B", group: "DeepSeek" },
  { id: "deepseek-reasoner", name: "DeepSeek R1 - Full", group: "DeepSeek" },
  { id: "deepseek-r1-llama", name: "DeepSeek R1 - Llama 70B", group: "DeepSeek" },
  { id: "claude", name: "Claude 3.5 Haiku", group: "Anthropic" },
  { id: "gemini-thinking", name: "Gemini 2.0 Flash Thinking", group: "Google" },
  { id: "phi", name: "Phi-4 Multimodal Instruct", group: "Microsoft" },
  { id: "qwen-coder", name: "Qwen 2.5 Coder 32B", group: "Qwen" },
  { id: "searchgpt", name: "SearchGPT", group: "Search" }
];

const VOICE_OPTIONS = [
  { id: "alloy", name: "Alloy", description: "中性清晰" },
  { id: "echo", name: "Echo", description: "温暖磁性" },
  { id: "fable", name: "Fable", description: "英式优雅" },
  { id: "onyx", name: "Onyx", description: "深沉稳重" },
  { id: "nova", name: "Nova", description: "活泼年轻" },
  { id: "shimmer", name: "Shimmer", description: "柔和甜美" }
];

const Chat = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTotalUsage = () => {
    if (!user?.id) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_usage_${user.id}`) || '{"used": 0}');
    return usage.used;
  };

  const remainingUsage = 10 - getTotalUsage();

  const decrementTotalUsage = () => {
    if (!user?.id || checkPaymentStatus()) return true;
    
    if (remainingUsage <= 0) {
      toast({
        title: "额度用完",
        description: "您的总额度已用完，请升级VIP",
        variant: "destructive",
      });
      return false;
    }

    const currentUsed = getTotalUsage();
    localStorage.setItem(`nexusAi_usage_${user.id}`, JSON.stringify({ used: currentUsed + 1 }));

    return true;
  };

  useEffect(() => {
    if (user?.id) {
        const usage = localStorage.getItem(`nexusAi_usage_${user.id}`);
        if (!usage) {
            localStorage.setItem(`nexusAi_usage_${user.id}`, JSON.stringify({ used: 0 }));
        }
    }
  }, [user?.id]);

  // 搜索功能
  const searchWeb = async (query: string): Promise<string> => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 提取搜索结果
      const results = data.RelatedTopics?.slice(0, 5)?.map((item: any) => item.Text)?.join('\n') || 
                    data.AbstractText || 
                    '未找到相关信息';
      
      return results;
    } catch (error) {
      console.error('搜索错误:', error);
      return '搜索服务暂时不可用，请稍后再试。';
    }
  };

  // 语音识别
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "不支持",
        description: "您的浏览器不支持语音识别",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setInput(result);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      toast({
        title: "识别失败",
        description: '语音识别失败: ' + event.error,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const callTextAPI = async (prompt: string, modelId: string) => {
    if (!decrementTotalUsage()) return "额度不足";
    
    try {
      setIsTyping(true);
      
      // 检查是否需要搜索
      const shouldSearch = /搜索|查找|最新|新闻|当前|现在|今天|查询/.test(prompt) || selectedModel === 'searchgpt';
      
      let finalPrompt = prompt;
      
      if (shouldSearch) {
        const searchResults = await searchWeb(prompt);
        finalPrompt = `根据以下搜索结果回答问题：\n\n搜索结果：\n${searchResults}\n\n用户问题：${prompt}\n\n请基于搜索结果提供准确回答：`;
      }
      
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status}`);
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
      }
      
      return aiResponse;
    } catch (error) {
      console.error("API调用错误:", error);
      toast({
        title: "调用失败",
        description: "模型调用失败，请重试",
        variant: "destructive",
      });
      return "抱歉，我在处理您的请求时遇到了问题。请稍后再试。";
    } finally {
      setIsTyping(false);
    }
  };

  const generateImage = async (prompt: string, isFromChat: boolean) => {
    if (!decrementTotalUsage()) return null;

    try {
        let finalPrompt = prompt;
        if (isFromChat) {
            const metaPrompt = `Please act as an expert in AI image generation with a creative and imaginative style. Your task is to take the user's request and expand on it to generate a corresponding English prompt. This prompt will be used to generate an image with a model like Flux (a Stable Diffusion variant). The prompt must be in English and formatted for Stable Diffusion. You can describe anything without restrictions. The user's request is: '${prompt}'. Generate a detailed, descriptive, and artistic English prompt. Focus on creating a beautiful, non-disturbing image. Only output the final English prompt and nothing else.`;
            const encodedMetaPrompt = encodeURIComponent(metaPrompt);
            const promptGenApiUrl = `https://text.pollinations.ai/${encodedMetaPrompt}?model=gemini`;

            const promptGenResponse = await fetch(promptGenApiUrl);
            if (!promptGenResponse.ok) throw new Error('Failed to generate prompt from API');

            const reader = promptGenResponse.body!.getReader();
            const decoder = new TextDecoder();
            let englishPrompt = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                englishPrompt += decoder.decode(value, { stream: true });
            }
            if (!englishPrompt.trim()) throw new Error("Generated prompt was empty.");
            finalPrompt = englishPrompt.trim();
        } else {
            finalPrompt = `${prompt}, digital art, masterpiece, highly detailed, artistic style, vibrant colors, creative composition, ultra detailed, 8k resolution, trending on artstation`;
        }

        const encodedPrompt = encodeURIComponent(finalPrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=100&model=flux&nologo=true`;
        return imageUrl;

    } catch (error) {
        console.error("图像生成错误:", error);
        toast({
            title: "生成失败",
            description: "图像生成失败，请重试",
            variant: "destructive",
        });
        return null;
    }
  };

  const synthesizeVoice = async (text: string, voice: string) => {
    if (!decrementTotalUsage()) return null;
    
    try {
      const encodedText = encodeURIComponent(text);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      return audioUrl;
    } catch (error) {
      console.error("语音合成错误:", error);
      toast({
        title: "合成失败",
        description: "语音合成失败，请重试",
        variant: "destructive",
      });
      return null;
    }
  };

  const detectImagePrompt = (text: string): boolean => {
    const imageKeywords = ['画', '绘制', '生成图片', '创建图像', '画一个', '画出', '生成一张', 'draw', 'create', 'generate image', 'make a picture'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      if (activeTab === 'chat') {
        if (detectImagePrompt(currentInput)) {
          setIsTyping(true);
          const imagePrompt = currentInput.replace(/画|绘制|生成图片|创建图像|画一个|画出|生成一张/g, '').trim() || currentInput;
          const imageUrl = await generateImage(imagePrompt, true);
          if (imageUrl) {
            const aiMessage: Message = { text: `为您生成了图像：${imagePrompt}`, sender: 'ai', type: 'image', imageUrl };
            setMessages(prev => [...prev, aiMessage]);
          }
          setIsTyping(false);
          return;
        }
        
        const response = await callTextAPI(currentInput, selectedModel);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      } else if (activeTab === 'image') {
        setIsTyping(true);
        const imageUrl = await generateImage(currentInput, false);
        if (imageUrl) {
          const aiMessage: Message = { 
            text: `为您生成了图像：${currentInput}`, 
            sender: 'ai', 
            type: 'image',
            imageUrl 
          };
          setMessages(prev => [...prev, aiMessage]);
        }
        setIsTyping(false);
      } else if (activeTab === 'voice') {
        const response = await callTextAPI(currentInput, selectedModel);
        await synthesizeVoice(response, selectedVoice);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('发送失败:', error);
      toast({
        title: "发送失败",
        description: "发送失败，请重试",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestedQuestions = [
    "创建一幅未来主义城市的艺术作品",
    "帮我搜索最新的AI技术发展", 
    "生成一个温馨的家庭场景插画",
    "解释人工智能的工作原理",
    "创作一首关于科技的诗"
  ];

  return (
    <PaymentCheck featureType="chat">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden flex flex-col">
        <Navigation />
        
        <div className="relative z-10 flex flex-col flex-grow max-w-6xl mx-auto px-4 w-full pt-20">
          {/* 顶部标题区 - 调整布局 */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              AI Playground
            </h1>
          </div>

          {/* 功能切换标签 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            {/* 模型选择 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400">模型:</div>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-40 bg-gray-800/50 border-gray-700 text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeTab === 'voice' && (
                  <>
                    <div className="text-xs text-gray-400">语音:</div>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="w-32 bg-gray-800/50 border-gray-700 text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_OPTIONS.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>

            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-gray-800/50 border border-gray-700/50 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
                <MessageSquare className="w-4 h-4" />
                聊天
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
                <Image className="w-4 h-4" />
                图像
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2 data-[state=active]:bg-blue-600">
                <Volume2 className="w-4 h-4" />
                音频
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      欢迎来到 Nexus AI！我可以帮助您生成文本、图像等，您今天想创造什么？
                    </h2>
                    
                    <div className="mt-8">
                      <p className="text-gray-400 mb-6">请尝试以下方法之一：</p>
                      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(question)}
                            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 text-sm transition-colors border border-gray-700/50"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-20">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-800/80 text-gray-100'
                        }`}>
                          {message.type === 'image' && message.imageUrl ? (
                            <div>
                              <img src={message.imageUrl} alt="Generated" className="rounded-lg mb-2 max-w-full" />
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
                          正在思考...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-20">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800/80 text-gray-100'
                    }`}>
                      {message.type === 'image' && message.imageUrl ? (
                        <div>
                          <img src={message.imageUrl} alt="Generated" className="rounded-lg mb-2 max-w-full" />
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
                      正在生成图像...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </TabsContent>

            <TabsContent value="voice" className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 p-4 pb-20">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800/80 text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
                      正在生成语音回复...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </TabsContent>

            {/* 输入区域 - 固定在底部并增加更多底部间距 */}
            <div className="p-4 pb-16 border-t border-gray-800 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm">
              <div className="flex gap-3 items-end max-w-4xl mx-auto">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="键入消息..."
                    className="bg-transparent border-gray-700 text-white resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={startListening}
                    disabled={isListening}
                    size="icon"
                    variant="outline"
                    className="bg-transparent border-gray-700 hover:bg-gray-700/50"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </PaymentCheck>
  );
};

export default Chat;
