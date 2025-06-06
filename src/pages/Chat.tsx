
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, MessageSquare, Image as ImageIcon, Mic, Upload, Sparkles, Download } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('chat');
  const [imagePrompt, setImagePrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // API调用函数保持不变
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
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}`;
      
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
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
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

  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) return;

    try {
      setIsGeneratingImage(true);
      const imageUrl = await generateImage(imagePrompt);
      
      toast({
        title: "图片生成成功",
        description: "您的图片已生成完成",
      });
      
      setImagePrompt('');
    } catch (error) {
      toast({
        title: "生成失败",
        description: "图片生成失败，请稍后再试",
        variant: "destructive",
      });
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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] z-0"></div>
      
      <Navigation />
      
      <main className="flex-grow flex flex-col pt-16 relative z-10 max-w-6xl mx-auto w-full px-4">
        
        {/* 顶部功能切换和模型选择 */}
        <div className="flex flex-col items-center mb-8 pt-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mb-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                聊天
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <ImageIcon className="h-4 w-4 mr-2" />
                图像
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <Mic className="h-4 w-4 mr-2" />
                音频
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 模型选择 - 小字体左对齐 */}
          <div className="w-full max-w-4xl mb-4">
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
              <div className="text-center mb-8">
                <h1 className="text-2xl font-medium text-slate-300 mb-4">
                  欢迎来到 Nexus AI！我可以帮助您生成文本、图像等，您今天想创造什么？
                </h1>
              </div>
              
              {/* 建议问题 */}
              <div className="max-w-4xl w-full">
                <p className="text-slate-400 text-center mb-4">请尝试以下方法之一：</p>
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
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-slate-300 mb-4">
                AI 图像生成
              </h1>
              <p className="text-slate-400">描述您想要的图像，AI将为您创作</p>
            </div>
            
            <div className="w-full max-w-2xl">
              <Textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="描述您想要生成的图像..."
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 min-h-[100px] mb-4"
                onKeyPress={handleKeyPress}
              />
              <Button
                onClick={handleImageGenerate}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成图像
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="flex-grow flex flex-col">
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-slate-300 mb-4">
                AI 语音功能
              </h1>
              <p className="text-slate-400">语音功能即将上线，敬请期待</p>
            </div>
            
            <div className="w-full max-w-2xl text-center">
              <Mic className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">该功能正在开发中...</p>
            </div>
          </div>
        </TabsContent>

        {/* 底部输入区域 - 仅聊天模式显示 */}
        {activeTab === 'chat' && (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-700/50 p-4">
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="border-slate-700 text-slate-400 hover:bg-slate-800 flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="键入消息..."
                className="flex-grow bg-transparent border-slate-700 text-white placeholder-slate-400"
                disabled={isTyping || isGeneratingImage}
              />
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
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
