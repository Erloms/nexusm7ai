import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 真实的Pollinations.ai支持的模型
  const models = [
    { id: 'openai', name: 'OpenAI GPT-4o-mini', description: 'OpenAI高效模型' },
    { id: 'openai-large', name: 'OpenAI GPT-4o', description: 'OpenAI旗舰模型' },
    { id: 'openai-reasoning', name: 'OpenAI o1-mini', description: 'OpenAI推理模型' },
    { id: 'llama', name: 'Llama 3.3 70B', description: 'Meta最新大模型' },
    { id: 'llamalight', name: 'Llama 3.1 8B Instruct', description: 'Meta轻量模型' },
    { id: 'mistral', name: 'Mistral Nemo', description: 'Mistral高效模型' },
    { id: 'deepseek', name: 'DeepSeek-V3', description: 'DeepSeek旗舰模型' },
    { id: 'deepseek-r1', name: 'DeepSeek-R1', description: 'DeepSeek推理模型' },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1 Full', description: 'DeepSeek完整推理模型' },
    { id: 'claude', name: 'Claude 3.5 Haiku', description: 'Anthropic快速模型' },
    { id: 'gemini', name: 'Gemini 2.0 Flash', description: 'Google最新模型' },
    { id: 'gemini-thinking', name: 'Gemini 2.0 Flash Thinking', description: 'Google思考模型' },
    { id: 'phi', name: 'Phi-4 Multimodal', description: 'Microsoft多模态模型' },
    { id: 'qwen-coder', name: 'Qwen 2.5 Coder 32B', description: 'Qwen代码专用模型' },
  ];

  // 引导问题
  const guideQuestions = [
    "写一篇关于人工智能未来发展的文章",
    "帮我生成一份周末旅行计划",
    "创作一首关于星空的诗歌"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 调用真实的Pollinations.ai API
  const callPollinationsAPI = async (prompt: string, modelId: string) => {
    try {
      console.log(`正在调用模型: ${modelId}, 提示词: ${prompt}`);
      
      // 编码提示词用于URL
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
      
      console.log(`API URL: ${apiUrl}`);
      
      // 发起请求
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status} ${response.statusText}`);
      }
      
      // 读取响应文本
      const responseText = await response.text();
      console.log(`API响应: ${responseText}`);
      
      return responseText || '抱歉，模型没有返回有效响应。';
      
    } catch (error) {
      console.error('API调用错误:', error);
      throw error;
    }
  };

  // 生成图片的函数
  const generateImage = async (prompt: string) => {
    try {
      setIsGeneratingImage(true);
      
      // 调用Pollinations.ai的图片生成API
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`;
      
      return imageUrl;
    } catch (error) {
      console.error('图片生成错误:', error);
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 检测是否为图片生成请求
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
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // 检测是否为图片生成请求
      if (isImageRequest(messageText)) {
        setIsGeneratingImage(true);
        const imageUrl = await generateImage(messageText);
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: `我为您生成了这张图片：`,
          isUser: false,
          timestamp: new Date(),
          imageUrl: imageUrl,
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setIsTyping(false);
      } else {
        // 调用真实的AI API进行文本对话
        const aiResponseText = await callPollinationsAPI(messageText, currentModel);
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: aiResponseText,
          isUser: false,
          timestamp: new Date(),
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setIsTyping(false);
      }
      
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsTyping(false);
      setIsGeneratingImage(false);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '抱歉，AI服务暂时不可用，请稍后再试。',
        isUser: false,
        timestamp: new Date(),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-nexus-dark via-nexus-purple/20 to-nexus-blue/10 z-0"></div>
      <div className="absolute inset-0 bg-grid-pattern bg-[length:50px_50px] opacity-5 z-0"></div>
      
      <Navigation />
      
      <main className="flex-grow flex flex-col pt-16 relative z-10">
        
        {/* 欢迎界面 - 无消息时显示 */}
        {messages.length === 0 && (
          <div className="flex-grow flex flex-col justify-center items-center px-4">
            {/* AI图标和标题 */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-8">
                <div className="bg-gradient-to-r from-nexus-blue to-nexus-cyan p-8 rounded-full shadow-2xl">
                  <Bot className="h-16 w-16 text-white" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-6">
                Nexus AI 对话
              </h1>
              <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">
                与AI智能对话，获得专业回答和创意灵感
              </p>
            </div>
            
            {/* 模型选择 - 居中显示 */}
            <div className="max-w-lg mx-auto w-full mb-12">
              <label className="block text-sm font-medium text-white mb-4 text-center">选择AI模型</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-nexus-dark/70 border-nexus-blue/30 text-white h-14 text-lg backdrop-blur-sm">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent className="bg-nexus-dark border-nexus-blue/30 z-50">
                  {models.map((model) => (
                    <SelectItem 
                      key={model.id} 
                      value={model.id}
                      className="text-white hover:bg-nexus-blue/20"
                    >
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-white/60">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 引导问题 */}
            <div className="max-w-4xl mx-auto w-full mb-8">
              <p className="text-white/60 text-center mb-6">或者试试以下问题：</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {guideQuestions.map((question, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    variant="outline"
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white hover:bg-nexus-blue/20 p-6 h-auto text-left whitespace-normal"
                  >
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 text-nexus-cyan mr-3 mt-1 flex-shrink-0" />
                      <span className="text-sm">{question}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 聊天消息区域 */}
        {messages.length > 0 && (
          <div className="flex-grow flex flex-col max-w-6xl mx-auto w-full px-4 py-6">
            {/* 头部信息 */}
            <div className="bg-gradient-to-r from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="mr-3 h-6 w-6 text-nexus-cyan" />
                  <h1 className="text-xl font-bold text-gradient">AI 智能对话</h1>
                </div>
                
                <div className="flex items-center gap-4">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-nexus-dark/50 border-nexus-blue/30 text-white w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-nexus-dark border-nexus-blue/30 z-50">
                      {models.map((model) => (
                        <SelectItem 
                          key={model.id} 
                          value={model.id}
                          className="text-white hover:bg-nexus-blue/20"
                        >
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => setMessages([])}
                    variant="outline"
                    size="sm"
                    className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                  >
                    新对话
                  </Button>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-grow bg-gradient-to-br from-nexus-dark/50 to-nexus-purple/20 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6 mb-6 overflow-hidden flex flex-col min-h-[600px]">
              <div className="flex-grow overflow-y-auto space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl p-6 ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-nexus-blue to-nexus-cyan text-white' 
                        : 'bg-nexus-dark/70 border border-nexus-blue/30 text-white'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {!message.isUser && <Bot className="h-6 w-6 text-nexus-cyan mt-1 flex-shrink-0" />}
                        <div className="flex-grow">
                          <p className="whitespace-pre-wrap leading-relaxed mb-3">{message.text}</p>
                          {message.imageUrl && (
                            <div className="mt-4">
                              <img 
                                src={message.imageUrl} 
                                alt="AI生成的图片" 
                                className="max-w-full h-auto rounded-lg border border-nexus-blue/30"
                                onLoad={() => scrollToBottom()}
                              />
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-3">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.isUser && <User className="h-6 w-6 text-white mt-1 flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(isTyping || isGeneratingImage) && (
                  <div className="flex justify-start">
                    <div className="bg-nexus-dark/70 border border-nexus-blue/30 rounded-xl p-6 max-w-[80%]">
                      <div className="flex items-center space-x-3">
                        <Bot className="h-6 w-6 text-nexus-cyan" />
                        <div className="flex items-center space-x-2">
                          {isGeneratingImage && <ImageIcon className="h-4 w-4 text-nexus-cyan" />}
                          <span className="text-white/70 text-sm">
                            {isGeneratingImage ? '正在生成图片...' : '正在思考...'}
                          </span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* 输入区域 - 固定在底部 */}
        <div className="max-w-6xl mx-auto w-full px-4 pb-6">
          <div className="bg-gradient-to-r from-nexus-dark/90 to-nexus-purple/40 backdrop-blur-md rounded-xl border border-nexus-blue/20 p-6">
            <div className="flex space-x-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="开始与AI对话吧！支持文字对话和图片生成..."
                className="flex-grow bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 h-14 text-lg"
                disabled={isTyping || isGeneratingImage}
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping || isGeneratingImage}
                className="bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:from-nexus-blue/80 hover:to-nexus-cyan/80 text-white h-14 px-8"
              >
                {(isTyping || isGeneratingImage) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-3 text-center">
              💡 输入"画一张..."或"生成图片..."即可创作AI画作
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
