import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Sparkles, User, Bot } from 'lucide-react';
import PaymentCheck from '@/components/PaymentCheck';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  group: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('openai');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Models grouped by provider
  const models: Record<string, Model[]> = {
    'OpenAI': [
      { id: 'openai', name: 'GPT-4o-mini', description: 'OpenAI GPT-4o-mini', group: 'OpenAI' },
      { id: 'openai-large', name: 'GPT-4o', description: 'OpenAI GPT-4o', group: 'OpenAI' },
      { id: 'openai-reasoning', name: 'o1-mini', description: 'OpenAI o1-mini', group: 'OpenAI' }
    ],
    'Google': [
      { id: 'gemini', name: 'Gemini 2.0 Flash', description: 'Gemini 2.0 Flash', group: 'Google' },
      { id: 'gemini-thinking', name: 'Gemini 2.0 Flash Thinking', description: 'Gemini 2.0 Flash Thinking', group: 'Google' }
    ],
    'Meta': [
      { id: 'llama', name: 'Llama 3.3 70B', description: 'Llama 3.3 70B', group: 'Meta' },
      { id: 'llamalight', name: 'Llama 3.1 8B Instruct', description: 'Llama 3.1 8B Instruct', group: 'Meta' }
    ],
    'DeepSeek': [
      { id: 'deepseek', name: 'DeepSeek-V3', description: 'DeepSeek-V3', group: 'DeepSeek' },
      { id: 'deepseek-r1', name: 'DeepSeek-R1 Distill Qwen 32B', description: 'DeepSeek-R1 Distill Qwen 32B', group: 'DeepSeek' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1 - Full', description: 'DeepSeek R1 - Full', group: 'DeepSeek' }
    ],
    'Other': [
      { id: 'mistral', name: 'Mistral Nemo', description: 'Mistral Nemo', group: 'Mistral' },
      { id: 'qwen-coder', name: 'Qwen 2.5 Coder 32B', description: 'Qwen 2.5 Coder 32B', group: 'Qwen' },
      { id: 'phi', name: 'Phi-4 Multimodal Instruct', description: 'Phi-4 Multimodal Instruct', group: 'Microsoft' }
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
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
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

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error calling AI API:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误，请稍后再试。' }]);
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

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <PaymentCheck>
        <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 pt-20 md:p-20">
          {/* Model selection sidebar */}
          <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-4 mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-nexus-blue" />
              选择模型
            </h2>
            
            <Select 
              value={selectedModel}
              onValueChange={setSelectedModel}
            >
              <SelectTrigger className="w-full bg-nexus-dark/50 border-nexus-blue/30 text-white">
                <SelectValue placeholder="选择AI模型" />
              </SelectTrigger>
              <SelectContent className="bg-nexus-dark border-nexus-blue/30">
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
            
            <div className="mt-4 p-3 bg-nexus-blue/10 rounded border border-nexus-blue/30 text-white/80 text-sm">
              <p className="text-nexus-cyan font-medium mb-1">当前模型</p>
              <p>{allModels.find(m => m.id === selectedModel)?.description || selectedModel}</p>
              <p className="mt-2 text-xs text-white/60">由 Pollinations.AI 提供技术支持</p>
            </div>
          </aside>
          
          {/* Chat area */}
          <div className="flex-grow flex flex-col bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 overflow-hidden">
            {/* Messages container */}
            <div 
              ref={chatContainerRef}
              className="flex-grow p-4 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 260px)' }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/60">
                  <div className="w-16 h-16 bg-nexus-blue/20 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-nexus-blue" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">开始你的AI对话</h3>
                  <p className="text-center max-w-md">
                    选择一个AI模型，然后在下方输入框中输入问题或指令，开始与AI助手��话。
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={index}
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-2xl p-4 ${
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
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="mb-4 flex justify-start">
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
              <div className="flex items-end gap-2">
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
                  disabled={loading || !input.trim()} 
                  className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                >
                  <Send className="w-4 h-4" />
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
