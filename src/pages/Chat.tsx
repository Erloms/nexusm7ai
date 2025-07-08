
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ChatSidebar from '@/components/ChatSidebar';
import { Send, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    { id: 'claude-3', name: 'Claude 3' },
    { id: 'gemini-pro', name: 'Gemini Pro' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!hasPermission('chat')) {
      toast({ 
        title: "需要会员权限", 
        description: "请升级会员以使用AI对话功能", 
        variant: "destructive" 
      });
      return;
    }

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 模拟AI回复
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `这是一个模拟的AI回复，回应您的问题："${input}"。在实际应用中，这里会连接到真实的AI模型进行对话。`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // 保存聊天记录
      if (user?.id) {
        const chatHistory = {
          id: Date.now().toString(),
          title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
          timestamp: new Date().toISOString(),
          preview: input.slice(0, 100),
          messages: [userMessage, aiMessage]
        };

        const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
        const updatedHistory = [chatHistory, ...existingHistory].slice(0, 10);
        localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleLoadHistory = (historyId: string) => {
    if (user?.id) {
      const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
      const historyItem = existingHistory.find((item: any) => item.id === historyId);
      if (historyItem && historyItem.messages) {
        setMessages(historyItem.messages);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419] flex">
      <Navigation />
      
      <div className="flex w-full pt-16">
        {/* 左侧边栏 */}
        <div className="w-80 flex-shrink-0">
          <ChatSidebar 
            onModelChange={setSelectedModel}
            selectedModel={selectedModel}
            onLoadHistory={handleLoadHistory}
            onNewChat={handleNewChat}
            aiModels={aiModels}
          />
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 会员提示横幅 */}
          {!hasPermission('chat') && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30 p-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-100">开通会员即可享受20+顶尖AI模型无限对话</span>
                </div>
                <Link to="/payment">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-2 rounded-full font-medium">
                    立即开通
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">开始对话</h2>
                  <p className="text-gray-400 text-lg">选择一个AI模型，开始您的智能对话之旅</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl rounded-2xl px-6 py-4 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ml-12' 
                          : 'bg-gray-800/80 text-gray-100 mr-12 border border-gray-700'
                      }`}>
                        <div className="prose prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-700 p-6">
            <div className="max-w-4xl mx-auto">
              {!hasPermission('chat') ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">请先升级会员使用AI对话功能</p>
                  <Link to="/payment">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium">
                      立即升级会员
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入您的问题..."
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:ring-cyan-400/20"
                      rows={1}
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium h-12 min-w-12"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
