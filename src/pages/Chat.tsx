
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Sparkles, User, Bot, ImageIcon, Info } from 'lucide-react';
import PaymentCheck from '@/components/PaymentCheck';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
}

interface ChatProps {
  decrementUsage?: () => void;
}

const Chat = ({ decrementUsage }: ChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [modelsFetched, setModelsFetched] = useState(false);

  // 获取最新可用的API模型
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://text.pollinations.ai/models');
        if (response.ok) {
          const modelsList = await response.json();
          
          // 处理API返回的模型数据并整理
          const processedModels: Model[] = [];
          
          // 优先添加这些热门模型
          const priorityModels = [
            'gemini', 
            'deepseek', 
            'gpt-4o', 
            'gpt-4.1',
            'claude'
          ];
          
          // 处理模型列表
          modelsList.forEach((model: any) => {
            // 使用模型完整名称
            const modelId = model.name || model;
            const modelName = model.description || model;
            const provider = model.provider || '';
            
            // 创建模型对象
            const modelObj = {
              id: modelId,
              name: modelName,
              description: `${provider ? provider + ' ' : ''}${modelName}`,
            };
            
            // 过滤掉Midjourney相关模型
            if (!modelId.toLowerCase().includes('midjourney')) {
              processedModels.push(modelObj);
            }
          });
          
          // 对模型进行排序，优先展示Gemini、DeepSeek、GPT-4和Claude系列
          processedModels.sort((a, b) => {
            const aHasPriority = priorityModels.some(pm => a.id.toLowerCase().includes(pm.toLowerCase()));
            const bHasPriority = priorityModels.some(pm => b.id.toLowerCase().includes(pm.toLowerCase()));
            
            if (aHasPriority && !bHasPriority) return -1;
            if (!aHasPriority && bHasPriority) return 1;
            return 0;
          });
          
          setAvailableModels(processedModels);
          
          // 默认选择gemini-2.5-pro或列表中的第一个模型
          const gemini25Pro = processedModels.find(m => m.id.toLowerCase().includes('gemini-2.5-pro'));
          if (gemini25Pro) {
            setSelectedModel(gemini25Pro.id);
          } else if (processedModels.length > 0) {
            setSelectedModel(processedModels[0].id);
          }
          
          setModelsFetched(true);
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        // 加载失败时使用备用模型列表
        const backupModels = [
          { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Google最新一代大语言模型' },
          { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', description: 'Anthropic最新高效模型' },
          { id: 'deepseek-r1-full', name: 'DeepSeek R1 Full', description: 'DeepSeek完整大语言模型' },
          { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI多模态大语言模型' },
          { id: 'gpt-4.1-nano', name: 'GPT-4.1-nano', description: 'OpenAI新一代大语言模型' },
          { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Meta开源大语言模型' },
          { id: 'gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash', description: 'Google闪电版模型' },
          { id: 'mistral-small-3.1-24b-instruct', name: 'Mistral Small 3.1', description: 'Mistral AI模型' },
          { id: 'phi-4-instruct', name: 'Phi-4 Instruct', description: 'Microsoft Phi-4模型' },
          { id: 'searchgpt', name: 'SearchGPT', description: '网络搜索增强语言模型' },
        ];
        
        setAvailableModels(backupModels);
        setSelectedModel('gemini-2.5-pro');
        setModelsFetched(true);
      }
    };

    fetchModels();
  }, []);

  // 当消息变化时，滚动到聊天底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;
    
    // 调用decrementUsage函数（如果提供）
    decrementUsage?.();
    
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      ...(uploadedImage && { image: uploadedImage })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedImage(null);
    setLoading(true);

    try {
      // 编码提示词用于URL
      const encodedPrompt = encodeURIComponent(input);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${selectedModel}`;

      // 获取响应
      const response = await fetch(apiUrl);

      // 获取响应数据
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
      }

      // 检查响应中是否有错误
      if (aiResponse.includes('{"error":')) {
        try {
          const errorObj = JSON.parse(aiResponse);
          throw new Error(errorObj.error || "API错误，请尝试其他模型");
        } catch (e) {
          throw new Error("API返回无效响应，请尝试其他模型");
        }
      }

      // 将AI响应添加到聊天中
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('调用AI API时出错:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `抱歉，发生了错误: ${error instanceof Error ? error.message : '请稍后再试或选择其他模型。'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 聊天建议
  const chatSuggestions = [
    "创建一篇关于人工智能的文章",
    "设计一个现代化的网站界面",
    "分析最新的科技趋势",
    "生成一段营销文案",
    "解释量子计算的基本原理"
  ];

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <PaymentCheck featureType="chat">
        <main className="flex-grow flex flex-col p-4 pt-20 md:p-8 md:pt-24 lg:p-12 lg:pt-32">
          {/* 页面标题 */}
          <div className="container mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-3">AI 对话</h1>
            <p className="text-white/70 text-lg">输入文本，选择模型，一键得到自然流畅的对话</p>
          </div>

          {/* 聊天区域 - 更宽、更高，增加上下空间 */}
          <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 overflow-hidden">
            {/* 消息容器 - 增加高度和上下边距 */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-6 md:p-8 overflow-y-auto"
              style={{ minHeight: "calc(100vh - 400px)" }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/60 py-12 md:py-24">
                  <div className="w-16 h-16 bg-nexus-blue/20 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-nexus-blue" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-6">开始你的AI对话</h3>
                  <p className="text-center max-w-lg mb-8 md:mb-12 text-lg">
                    选择一个AI模型，然后在下方输入框中输入问题或指令，开始与AI助手对话。
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
                    {chatSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg px-4 py-3 cursor-pointer hover:bg-nexus-blue/20 transition-colors"
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => {
                            const textArea = document.querySelector('textarea');
                            if (textArea) textArea.focus();
                          }, 100);
                        }}
                      >
                        <p className="text-white/80">{suggestion}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 md:mt-12 bg-nexus-blue/10 p-4 rounded-lg border border-nexus-blue/30 max-w-3xl w-full">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-nexus-cyan" />
                      使用小技巧
                    </h4>
                    <ul className="text-white/70 text-sm space-y-1 list-disc pl-5">
                      <li>上传图片可以让AI理解图像内容并基于图像回答问题</li>
                      <li>使用精确的指令可以获得更好的回答质量</li>
                      <li>长篇内容可以分段提问，效果更佳</li>
                      <li>不同模型擅长不同领域，可以尝试多种模型找到最合适的</li>
                      <li>复杂问题可以拆分成多个简单问题，逐步提问获得更完整的回答</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-nexus-blue text-white rounded-tr-none' 
                          : 'bg-nexus-dark/80 border border-nexus-blue/20 text-white rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {msg.role === 'assistant' ? (
                          <Bot className="w-5 h-5 mr-2 text-nexus-cyan" />
                        ) : (
                          <User className="w-5 h-5 mr-2" />
                        )}
                        <p className="font-medium text-sm">
                          {msg.role === 'assistant' ? availableModels.find(m => m.id === selectedModel)?.name || 'AI助手' : '你'}
                        </p>
                      </div>
                      
                      {msg.image && (
                        <div className="mb-3">
                          <img 
                            src={msg.image} 
                            alt="Uploaded image" 
                            className="max-w-full max-h-[300px] rounded-lg object-contain"
                          />
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="mb-6 flex justify-start">
                  <div className="max-w-[75%] rounded-2xl p-4 bg-nexus-dark/80 border border-nexus-blue/20 text-white rounded-tl-none animate-pulse">
                    <div className="flex items-center mb-2">
                      <Bot className="w-5 h-5 mr-2 text-nexus-cyan" />
                      <p className="font-medium text-sm">{availableModels.find(m => m.id === selectedModel)?.name || 'AI助手'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-nexus-cyan/60 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-nexus-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-nexus-cyan/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* 输入区域 */}
            <div className="p-5 border-t border-nexus-blue/20 bg-nexus-dark/50 backdrop-blur-md">
              {/* 模型选择 - 放到输入框上方 */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2 text-white">
                  <Sparkles className="h-4 w-4 text-nexus-blue" />
                  <span className="text-sm">选择模型:</span>
                </div>
                <div className="flex-grow">
                  <Select 
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="w-full lg:w-auto bg-nexus-dark/50 border-nexus-blue/30 text-white h-9">
                      <SelectValue placeholder="选择AI模型" />
                    </SelectTrigger>
                    <SelectContent className="bg-nexus-dark border-nexus-blue/30 max-h-[300px]">
                      {availableModels.map((model) => (
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
                </div>
                <div className="w-full lg:w-auto text-white/60 text-xs">
                  {availableModels.find(m => m.id === selectedModel)?.description || '加载模型中...'}
                </div>
              </div>
              
              {uploadedImage && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={uploadedImage} 
                    alt="To upload" 
                    className="h-16 rounded-lg border border-nexus-blue/30"
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
                    onClick={clearUploadedImage}
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="p-2 rounded-md bg-nexus-dark border border-nexus-blue/30 text-white cursor-pointer hover:bg-nexus-blue/10"
                >
                  <ImageIcon className="w-5 h-5" />
                </label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题或指令..."
                  className="resize-none bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  rows={2}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || (!input.trim() && !uploadedImage)} 
                  className="bg-nexus-blue hover:bg-nexus-blue/80 text-white h-12 w-12 p-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 底部间距 */}
          <div className="py-8"></div>
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Chat;
