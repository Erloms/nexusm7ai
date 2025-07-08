
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Send, User, Bot, Crown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ChatSidebar from '@/components/ChatSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const aiModels = [
    { id: 'gpt-4', name: 'GPT-4', group: 'OpenAI' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', group: 'OpenAI' },
    { id: 'claude-3', name: 'Claude-3', group: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', group: 'Google' },
    { id: 'llama-2', name: 'Llama 2', group: 'Meta' }
  ];

  // Check if user has active membership
  const isVipUser = () => {
    // In a real app, this would check against the database
    const users = JSON.parse(localStorage.getItem('nexusAi_users') || '[]');
    const currentUser = users.find((u: any) => u.email === user?.email);
    return currentUser?.membershipType === 'annual' || currentUser?.membershipType === 'lifetime';
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Check membership before allowing chat
    if (!isVipUser()) {
      toast({
        title: "需要会员权限",
        description: "请先开通会员以使用AI对话功能",
        variant: "destructive"
      });
      return;
    }

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
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `这是来自 ${selectedModel} 的回复：${input}。这是一个模拟回复，在实际应用中会连接到真实的AI模型。`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        // Save chat history
        saveChatHistory([...messages, userMessage, aiMessage]);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const saveChatHistory = (chatMessages: Message[]) => {
    if (!user?.id || chatMessages.length === 0) return;

    const chatHistory = {
      id: currentChatId || Date.now().toString(),
      title: chatMessages[0]?.content.slice(0, 30) + '...' || '新对话',
      timestamp: new Date().toISOString(),
      preview: chatMessages[0]?.content.slice(0, 100) || '',
      messages: chatMessages
    };

    const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
    const updatedHistory = currentChatId 
      ? existingHistory.map((h: any) => h.id === currentChatId ? chatHistory : h)
      : [...existingHistory, chatHistory];

    localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory));
    
    if (!currentChatId) {
      setCurrentChatId(chatHistory.id);
    }
  };

  const handleLoadHistory = (historyId: string) => {
    if (!user?.id) return;
    
    const savedHistory = localStorage.getItem(`chat_history_${user.id}`);
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      const chat = history.find((h: any) => h.id === historyId);
      if (chat) {
        setMessages(chat.messages || []);
        setCurrentChatId(historyId);
      }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="flex h-[calc(100vh-80px)]">
        <ChatSidebar
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onLoadHistory={handleLoadHistory}
          onNewChat={handleNewChat}
          aiModels={aiModels}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!isVipUser() && (
              <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Crown className="h-6 w-6 text-amber-400" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">升级会员解锁AI对话</h3>
                      <p className="text-gray-300 text-sm">开通会员即可享受20+顶尖AI模型无限对话</p>
                    </div>
                    <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                      <Link to="/payment">立即升级</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Bot className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">开始对话</h2>
                  <p className="text-gray-400 mb-6">
                    选择一个AI模型，开始您的智能对话之旅
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-[#1a2436] text-gray-200 border border-[#2a3441]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-[#1a2436] rounded-2xl px-4 py-3 border border-[#2a3441]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-6 border-t border-[#232b3a]">
            <div className="flex space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isVipUser() ? "输入您的问题..." : "请先升级会员使用AI对话功能"}
                className="flex-1 bg-[#1a2436] border-[#2a3441] text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!isVipUser() || isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || !isVipUser() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
