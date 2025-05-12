
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Sparkles, User, Bot, ImageIcon } from 'lucide-react';
import PaymentCheck from '@/components/PaymentCheck';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface ChatProps {
  decrementUsage?: () => void;
}

const Chat = ({ decrementUsage }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableModels, setAvailableModels] = useState<Record<string, Model[]>>({});
  const [modelsFetched, setModelsFetched] = useState(false);

  // 获取最新可用的API模型
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://text.pollinations.ai/models');
        if (response.ok) {
          const modelsList = await response.json();
          
          // 整理模型列表
          const organizedModels: Record<string, Model[]> = {
            'OpenAI': [],
            'Gemini': [],
            'Meta': [],
            'DeepSeek': [],
            'Other': []
          };
          
          modelsList.forEach((model: string) => {
            if (model.toLowerCase().includes('gpt')) {
              organizedModels['OpenAI'].push({
                id: model,
                name: model,
                description: `OpenAI ${model} 大语言模型`,
                group: 'OpenAI'
              });
            } else if (model.toLowerCase().includes('gemini')) {
              organizedModels['Gemini'].push({
                id: model,
                name: model,
                description: `Google ${model} 大语言模型`,
                group: 'Gemini'
              });
            } else if (model.toLowerCase().includes('llama') || model.toLowerCase().includes('meta')) {
              organizedModels['Meta'].push({
                id: model,
                name: model,
                description: `Meta ${model} 大语言模型`,
                group: 'Meta'
              });
            } else if (model.toLowerCase().includes('deepseek')) {
              organizedModels['DeepSeek'].push({
                id: model,
                name: model,
                description: `国产 ${model} 大语言模型`,
                group: 'DeepSeek'
              });
            } else {
              organizedModels['Other'].push({
                id: model,
                name: model,
                description: `${model} 大语言模型`,
                group: 'Other'
              });
            }
          });
          
          setAvailableModels(organizedModels);
          setModelsFetched(true);
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        // 加载失败时使用备用模型列表
        setAvailableModels({
          'OpenAI': [
            { id: 'gpt-4o-mini', name: 'GPT-4o-mini', description: 'OpenAI GPT-4o-mini 多模态模型', group: 'OpenAI' },
            { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4o 多模态大语言模型', group: 'OpenAI' },
            { id: 'o1-mini', name: 'o1-mini', description: 'OpenAI o1-mini 轻量级大语言模型', group: 'OpenAI' },
            { id: 'gpt-4.1-nano', name: 'GPT-4.1-nano', description: 'OpenAI GPT-4.1-nano 新一代大语言模型', group: 'OpenAI' },
            { id: 'gpt-4.1-mini', name: 'GPT-4.1-mini', description: 'OpenAI GPT-4.1-mini 新一代大语言模型', group: 'OpenAI' }
          ],
          'Gemini': [
            { id: 'gemini-2.5-pro-exp-03-25', name: 'Gemini 2.5 Pro (exp-03-25)', description: 'Google最新一代大语言模型', group: 'Gemini' },
            { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini 2.5 Flash (preview-04-17)', description: 'Google Gemini 2.5 系列闪电版', group: 'Gemini' }
          ],
          'Meta': [
            { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', description: 'Meta开源大模型最新版', group: 'Meta' },
            { id: '@cf/meta/llama-3.1-8b-instruct', name: '@cf/meta/llama-3.1-8b-instruct', description: 'Meta轻量级开源大模型', group: 'Meta' }
          ],
          'DeepSeek': [
            { id: 'DeepSeek-V3-0324', name: 'DeepSeek-V3-0324', description: '国产大模型DeepSeek最新版', group: 'DeepSeek' },
            { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', description: 'DeepSeek精华版32B大模型', group: 'DeepSeek' }
          ],
          'Other': [
            { id: 'mistral-small-3.1-24b-instruct-2503', name: 'mistral-small-3.1-24b-instruct-2503', description: 'Mistral最新指令微调模型', group: 'Mistral' },
            { id: 'qwen2.5-coder-32b-instruct', name: 'qwen2.5-coder-32b-instruct', description: 'Qwen 2.5 编程专用模型', group: 'Qwen' },
            { id: 'phi-4-instruct', name: 'phi-4-instruct', description: 'Microsoft Phi-4 指令微调模型', group: 'Microsoft' }
          ]
        });
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

  // 获取所有模型的平面数组，用于显示
  const allModels = Object.values(availableModels).flat();

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <PaymentCheck featureType="chat">
        <main className="flex-grow flex flex-col p-4 pt-12 md:p-6">
          {/* 页面标题 */}
          <div className="container mx-auto text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">AI 对话</h1>
            <p className="text-white/70 text-lg">输入文本，选择模型，一键得到自然流畅的对话</p>
          </div>

          {/* 顶部栏 - 模型选择 */}
          <div className="w-full max-w-7xl mx-auto mb-4 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-3">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 text-white">
                <Sparkles className="h-5 w-5 text-nexus-blue" />
                <span className="font-medium">选择模型:</span>
              </div>
              <div className="ml-4 w-64 md:w-96">
                <Select 
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                >
                  <SelectTrigger className="w-full bg-nexus-dark/50 border-nexus-blue/30 text-white h-9">
                    <SelectValue placeholder="选择AI模型" />
                  </SelectTrigger>
                  <SelectContent className="bg-nexus-dark border-nexus-blue/30 max-h-[400px]">
                    {Object.entries(availableModels).map(([group, groupModels]) => (
                      <div key={group} className="p-1">
                        <h3 className="text-xs text-nexus-blue uppercase font-bold px-2 py-1">{group}</h3>
                        {groupModels.map((model) => (
                          <SelectItem 
                            key={model.id} 
                            value={model.id}
                            className="text-white hover:bg-nexus-blue/20"
                          >
                            {model.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-4 text-white/70 text-sm hidden md:block">
                {allModels.find(m => m.id === selectedModel)?.description || '加载模型中...'}
              </div>
            </div>
          </div>

          {/* 聊天区域 - 更宽、更高 */}
          <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 overflow-hidden">
            {/* 消息容器 - 增加高度 */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-4 md:p-6 overflow-y-auto"
              style={{ minHeight: "calc(100vh - 380px)" }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/60 py-20">
                  <div className="w-16 h-16 bg-nexus-blue/20 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="w-8 h-8 text-nexus-blue" />
                  </div>
                  <h3 className="text-2xl font-medium text-white mb-6">开始你的AI对话</h3>
                  <p className="text-center max-w-lg mb-12 text-lg">
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

                  <div className="mt-12 bg-nexus-blue/10 p-4 rounded-lg border border-nexus-blue/30 max-w-3xl w-full">
                    <h4 className="font-medium text-white mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-nexus-cyan" />
                      使用小技巧
                    </h4>
                    <ul className="text-white/70 text-sm space-y-1 list-disc pl-5">
                      <li>上传图片可以让AI理解图像内容并基于图像回答问题</li>
                      <li>使用精确的指令可以获得更好的回答质量</li>
                      <li>长篇内容可以分段提问，效果更佳</li>
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
                          {msg.role === 'assistant' ? allModels.find(m => m.id === selectedModel)?.name || 'AI助手' : '你'}
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
                      <p className="font-medium text-sm">{allModels.find(m => m.id === selectedModel)?.name || 'AI助手'}</p>
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
            <div className="p-4 border-t border-nexus-blue/20 bg-nexus-dark/50 backdrop-blur-md">
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
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Chat;
