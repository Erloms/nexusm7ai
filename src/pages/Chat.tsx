import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChatHistory from '@/components/ChatHistory';
import UsageTracker from '@/components/UsageTracker';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  model: string;
}

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(10);
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: `session_${Date.now()}`,
    title: '',
    timestamp: new Date(),
    messages: [],
    model: 'gpt-4o'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI最新旗舰模型' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'OpenAI高效轻量模型' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic最强推理模型' },
    { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', description: 'Anthropic快速响应模型' },
    { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'Google最新一代大语言模型' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Google长上下文模型' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek最新推理模型' },
    { id: 'deepseek-v3', name: 'DeepSeek V3', description: 'DeepSeek开源旗舰模型' },
  ];

  // 检查是否为付费用户
  const isPaidUser = user && JSON.parse(localStorage.getItem('nexusAi_users') || '[]')
    .find((u: any) => u.id === user.id)?.isPaid;

  useEffect(() => {
    // 加载使用次数
    if (user) {
      const usage = parseInt(localStorage.getItem(`chat_usage_${user.id}`) || '0');
      setUsageCount(usage);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 检查使用次数限制（仅对非付费用户）
    if (!isPaidUser && usageCount >= maxUsage) {
      toast({
        title: "使用次数已达上限",
        description: `免费用户每日限制${maxUsage}次对话，请升级VIP享受无限制使用`,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    // Update current session
    setCurrentSession(prev => ({
      ...prev,
      messages: updatedMessages,
      model: selectedModel,
      timestamp: new Date()
    }));

    // Update usage count for non-paid users
    if (!isPaidUser) {
      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      if (user) {
        localStorage.setItem(`chat_usage_${user.id}`, newUsageCount.toString());
      }
    }

    try {
      // 模拟AI回复
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: `这是来自${models.find(m => m.id === selectedModel)?.name}的回复。您说："${userMessage.text}"。我理解您的需求，这里是我的回应...`,
          isUser: false,
          timestamp: new Date(),
        };
        
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        setCurrentSession(prev => ({
          ...prev,
          messages: finalMessages
        }));
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsTyping(false);
      toast({
        title: "发送失败",
        description: "消息发送失败，请稍后再试",
        variant: "destructive",
      });
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setSelectedModel(session.model);
    setCurrentSession(session);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSession({
      id: `session_${Date.now()}`,
      title: '',
      timestamp: new Date(),
      messages: [],
      model: selectedModel
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex gap-4 p-4 pt-16 md:p-8">
        {/* Left Sidebar - Chat History */}
        <div className="hidden lg:block">
          <ChatHistory 
            onLoadSession={loadSession}
            currentSession={currentSession}
            onSaveCurrentSession={() => {}}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-3 h-6 w-6 text-nexus-cyan" />
                <h1 className="text-2xl font-bold text-gradient">AI 智能对话</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={startNewChat}
                  variant="outline"
                  size="sm"
                  className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                >
                  新对话
                </Button>
                
                {/* Usage count display for non-paid users */}
                {!isPaidUser && (
                  <div className="flex items-center bg-nexus-dark/50 rounded-lg px-4 py-2 border border-nexus-blue/30">
                    <span className="text-white/80 text-sm mr-2">今日使用:</span>
                    <span className={`font-bold ${usageCount >= maxUsage ? 'text-red-400' : 'text-nexus-cyan'}`}>
                      {usageCount}/{maxUsage}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-2">选择模型</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-nexus-dark/50 border-nexus-blue/30 text-white max-w-md">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent className="bg-nexus-dark border-nexus-blue/30">
                  {models.map((model) => (
                    <SelectItem 
                      key={model.id} 
                      value={model.id}
                      className="text-white hover:bg-nexus-blue/20"
                    >
                      <div>
                        <div>{model.name}</div>
                        <div className="text-xs text-white/60">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6 mb-6 overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60">开始与AI对话吧！</p>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    message.isUser 
                      ? 'bg-nexus-blue text-white' 
                      : 'bg-nexus-dark/50 border border-nexus-blue/30 text-white'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {!message.isUser && <Bot className="h-5 w-5 text-nexus-cyan mt-1 flex-shrink-0" />}
                      <div className="flex-grow">
                        <p className="whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.isUser && <User className="h-5 w-5 text-white mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-nexus-cyan" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-nexus-cyan rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的消息..."
                className="flex-grow bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50"
                disabled={isTyping || (!isPaidUser && usageCount >= maxUsage)}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping || (!isPaidUser && usageCount >= maxUsage)}
                className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Usage Tracker */}
        <div className="hidden xl:block">
          <UsageTracker />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
