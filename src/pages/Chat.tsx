
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const models = [
    { id: 'gpt-4', name: 'GPT-4o', description: 'OpenAI最新模型' },
    { id: 'claude-3.5', name: 'Claude 3.5 Haiku', description: 'Anthropic最新小型模型' },
    { id: 'gemini-2.5', name: 'Gemini 2.5 Pro', description: 'Google最新一代大语言模型' },
    { id: 'deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek最新大语言模型' },
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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // 更新使用次数（仅对非付费用户）
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
        
        setMessages(prev => [...prev, aiMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow flex flex-col p-4 pt-16 md:p-8">
        <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col">
          {/* 头部 */}
          <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-3 h-6 w-6 text-nexus-cyan" />
                <h1 className="text-2xl font-bold text-gradient">AI 智能对话</h1>
              </div>
              
              {/* 使用次数显示 */}
              {!isPaidUser && (
                <div className="flex items-center bg-nexus-dark/50 rounded-lg px-4 py-2 border border-nexus-blue/30">
                  <span className="text-white/80 text-sm mr-2">今日使用:</span>
                  <span className={`font-bold ${usageCount >= maxUsage ? 'text-red-400' : 'text-nexus-cyan'}`}>
                    {usageCount}/{maxUsage}
                  </span>
                </div>
              )}
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

          {/* 消息区域 */}
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
            
            {/* 输入区域 */}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
