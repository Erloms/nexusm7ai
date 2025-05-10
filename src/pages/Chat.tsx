
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

  // Models grouped by provider - updated with working models
  const models: Record<string, Model[]> = {
    'OpenAI': [
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini', description: 'OpenAI GPT-4o-mini', group: 'OpenAI' },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI GPT-4o', group: 'OpenAI' },
      { id: 'o1-mini', name: 'o1-mini', description: 'OpenAI o1-mini', group: 'OpenAI' }
    ],
    'Meta': [
      { id: 'llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Llama 3.3 70B', group: 'Meta' },
      { id: '@cf/meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B Instruct', description: 'Llama 3.1 8B Instruct', group: 'Meta' }
    ],
    'DeepSeek': [
      { id: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', name: 'DeepSeek-R1 Distill Qwen 32B', description: 'DeepSeek-R1 Distill Qwen 32B', group: 'DeepSeek' }
    ],
    'Other': [
      { id: 'mistral-small-3.1-24b-instruct-2503', name: 'Mistral Small 3.1', description: 'Mistral Small 3.1', group: 'Mistral' },
      { id: 'qwen2.5-coder-32b-instruct', name: 'Qwen 2.5 Coder 32B', description: 'Qwen 2.5 Coder 32B', group: 'Qwen' },
      { id: 'phi-4-instruct', name: 'Phi-4 Instruct', description: 'Phi-4 Instruct', group: 'Microsoft' }
    ]
  };

  // Get flat array of all models for selection dropdown
  const allModels = Object.values(models).flat();

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;
    
    // Call decrementUsage if provided (for non-paying users)
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
      // Encode the prompt for URL
      const encodedPrompt = encodeURIComponent(input);
      const model = allModels.find(m => m.id === selectedModel);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${selectedModel}`;

      // Fetch the response
      const response = await fetch(apiUrl);

      // Get the response data
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
      }

      // Check for error in response
      if (aiResponse.includes('{"error":')) {
        try {
          const errorObj = JSON.parse(aiResponse);
          throw new Error(errorObj.error || "API错误，请尝试其他模型");
        } catch (e) {
          throw new Error("API返回无效响应，请尝试其他模型");
        }
      }

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error calling AI API:', error);
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

  // Example chat suggestions
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
        <main className="flex-grow flex flex-col p-4 pt-16 md:p-10">
          {/* Top Bar - Model Selection */}
          <div className="flex items-center mb-4 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-3">
            <div className="flex items-center space-x-2 text-white">
              <Sparkles className="h-5 w-5 text-nexus-blue" />
              <span className="font-medium">选择模型:</span>
            </div>
            <div className="ml-4 flex-grow max-w-xs">
              <Select 
                value={selectedModel}
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="w-full bg-nexus-dark/50 border-nexus-blue/30 text-white h-9">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent className="bg-nexus-dark border-nexus-blue/30 max-h-[400px]">
                  {Object.entries(models).map(([group, groupModels]) => (
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
              {allModels.find(m => m.id === selectedModel)?.description}
            </div>
          </div>

          {/* Chat Area - Full Width */}
          <div className="flex-grow flex flex-col bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 overflow-hidden">
            {/* Messages container */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-4 md:p-6 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 260px)' }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/60">
                  <div className="w-16 h-16 bg-nexus-blue/20 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-nexus-blue" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-4">开始你的AI对话</h3>
                  <p className="text-center max-w-md mb-8">
                    选择一个AI模型，然后在下方输入框中输入问题或指令，开始与AI助手对话。
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                    {chatSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg px-4 py-2 cursor-pointer hover:bg-nexus-blue/20 transition-colors"
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => {
                            const textArea = document.querySelector('textarea');
                            if (textArea) textArea.focus();
                          }, 100);
                        }}
                      >
                        <p className="text-white/80 text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 ${
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
                  <div className="max-w-[80%] rounded-2xl p-4 bg-nexus-dark/80 border border-nexus-blue/20 text-white rounded-tl-none animate-pulse">
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
            
            {/* Input area */}
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
                  rows={1}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || (!input.trim() && !uploadedImage)} 
                  className="bg-nexus-blue hover:bg-nexus-blue/80 text-white h-10 w-10 p-0"
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
