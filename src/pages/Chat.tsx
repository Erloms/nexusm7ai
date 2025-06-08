import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Image, Volume2, Mic, MicOff, Send, Copy, Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import PaymentCheck from '@/components/PaymentCheck';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  type?: 'text' | 'image';
  imageUrl?: string;
}

const AI_MODELS = [
  { id: "openai", name: "OpenAI GPT-4o-mini", group: "OpenAI" },
  { id: "openai-large", name: "OpenAI GPT-4o", group: "OpenAI" },
  { id: "openai-reasoning", name: "OpenAI o1-mini", group: "OpenAI" },
  { id: "llama", name: "Llama 3.3 70B", group: "Meta" },
  { id: "llamalight", name: "Llama 3.1 8B Instruct", group: "Meta" },
  { id: "mistral", name: "Mistral Nemo", group: "Mistral" },
  { id: "deepseek", name: "DeepSeek-V3", group: "DeepSeek" },
  { id: "deepseek-r1", name: "DeepSeek-R1 Distill Qwen 32B", group: "DeepSeek" },
  { id: "deepseek-reasoner", name: "DeepSeek R1 - Full", group: "DeepSeek" },
  { id: "deepseek-r1-llama", name: "DeepSeek R1 - Llama 70B", group: "DeepSeek" },
  { id: "claude", name: "Claude 3.5 Haiku", group: "Anthropic" },
  { id: "gemini", name: "Gemini 2.0 Flash", group: "Google" },
  { id: "gemini-thinking", name: "Gemini 2.0 Flash Thinking", group: "Google" },
  { id: "phi", name: "Phi-4 Multimodal Instruct", group: "Microsoft" },
  { id: "qwen-coder", name: "Qwen 2.5 Coder 32B", group: "Qwen" },
  { id: "searchgpt", name: "SearchGPT", group: "Search" }
];

const VOICE_OPTIONS = [
  { id: "alloy", name: "Alloy", description: "中性清晰" },
  { id: "echo", name: "Echo", description: "温暖磁性" },
  { id: "fable", name: "Fable", description: "英式优雅" },
  { id: "onyx", name: "Onyx", description: "深沉稳重" },
  { id: "nova", name: "Nova", description: "活泼年轻" },
  { id: "shimmer", name: "Shimmer", description: "柔和甜美" }
];

const Chat = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取总额度使用情况
  const getTotalUsage = () => {
    if (!user?.id) return 0;
    
    const chatUsage = JSON.parse(localStorage.getItem(`nexusAi_chat_usage_${user.id}`) || '{"remaining": 10}');
    const imageUsage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    const voiceUsage = JSON.parse(localStorage.getItem(`nexusAi_voice_usage_${user.id}`) || '{"remaining": 10}');
    
    const totalUsed = (10 - chatUsage.remaining) + (10 - imageUsage.remaining) + (10 - voiceUsage.remaining);
    return Math.min(totalUsed, 10);
  };

  const remainingUsage = 10 - getTotalUsage();

  const decrementTotalUsage = () => {
    if (!user?.id || checkPaymentStatus()) return true;
    
    if (remainingUsage <= 0) {
      toast.error("您的额度已用完，请升级VIP");
      return false;
    }

    // 统一从总额度中扣除
    const currentUsed = getTotalUsage();
    const newUsed = currentUsed + 1;
    
    // 更新到对应功能的本地存储
    const storageKey = activeTab === 'chat' ? 'chat' : activeTab === 'image' ? 'image' : 'voice';
    const currentStorage = JSON.parse(localStorage.getItem(`nexusAi_${storageKey}_usage_${user.id}`) || '{"remaining": 10}');
    const newRemaining = Math.max(0, currentStorage.remaining - 1);
    
    localStorage.setItem(`nexusAi_${storageKey}_usage_${user.id}`, JSON.stringify({
      remaining: newRemaining
    }));

    return true;
  };

  // 语音识别
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('您的浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0][0].transcript;
      setInput(result);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      toast.error('语音识别失败: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const callTextAPI = async (prompt: string, modelId: string) => {
    if (!decrementTotalUsage()) return "额度不足";
    
    try {
      setIsTyping(true);
      const encodedPrompt = encodeURIComponent(prompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API响应错误: ${response.status}`);
      }
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;
      }
      
      return aiResponse;
    } catch (error) {
      console.error("API调用错误:", error);
      toast.error("模型调用失败，请重试");
      return "抱歉，我在处理您的请求时遇到了问题。请稍后再试。";
    } finally {
      setIsTyping(false);
    }
  };

  const generateImage = async (prompt: string) => {
    if (!decrementTotalUsage()) return null;
    
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
      return imageUrl;
    } catch (error) {
      console.error("图像生成错误:", error);
      toast.error("图像生成失败，请重试");
      return null;
    }
  };

  const synthesizeVoice = async (text: string, voice: string) => {
    if (!decrementTotalUsage()) return null;
    
    try {
      const encodedText = encodeURIComponent(text);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
      
      const audio = new Audio(audioUrl);
      audio.play();
      
      return audioUrl;
    } catch (error) {
      console.error("语音合成错误:", error);
      toast.error("语音合成失败，请重试");
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      if (activeTab === 'chat') {
        const response = await callTextAPI(currentInput, selectedModel);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      } else if (activeTab === 'image') {
        const imageUrl = await generateImage(currentInput);
        if (imageUrl) {
          const aiMessage: Message = { 
            text: `为您生成了图像：${currentInput}`, 
            sender: 'ai', 
            type: 'image',
            imageUrl 
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else if (activeTab === 'voice') {
        const response = await callTextAPI(currentInput, selectedModel);
        await synthesizeVoice(response, selectedVoice);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('发送失败:', error);
      toast.error('发送失败，请重试');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestedQuestions = [
    "创建未来主义者的肖像...",
    "描绘一个 AI 的未来...", 
    "生成网络...",
    "解释神经网络如何...",
    "用..."
  ];

  return (
    <PaymentCheck featureType="chat">
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* 星空背景 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
                           radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)`,
          backgroundSize: '800px 800px, 600px 600px, 400px 400px',
          opacity: 0.3
        }}></div>

        <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto">
          {/* 顶部标题区 */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              大梦 AI
            </h1>
            <p className="text-gray-400 text-sm">
              {!checkPaymentStatus() && `剩余额度: ${remainingUsage}/10`}
            </p>
          </div>

          {/* 功能切换标签 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-700/50 mb-6">
              <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                <MessageSquare className="w-4 h-4" />
                聊天
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                <Image className="w-4 h-4" />
                图像
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2 data-[state=active]:bg-purple-600">
                <Volume2 className="w-4 h-4" />
                音频
              </TabsTrigger>
            </TabsList>

            {/* 模型选择 */}
            <div className="flex justify-between items-center mb-4">
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTab === 'voice' && (
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-32 bg-gray-900/50 border-gray-700 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center py-20">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      欢迎来到 DreamBig AI！我可以帮助您生成文本、图像等，您今天想创造什么？
                    </h2>
                    
                    <div className="mt-24 mb-8">
                      <p className="text-gray-400 mb-6">请尝试以下方法之一：</p>
                      <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                        {suggestedQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => setInput(question)}
                            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 text-sm transition-colors border border-gray-700/50"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 p-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-800/80 text-gray-100'
                        }`}>
                          {message.type === 'image' && message.imageUrl ? (
                            <div>
                              <img src={message.imageUrl} alt="Generated" className="rounded-lg mb-2 max-w-full" />
                              <p className="text-sm">{message.text}</p>
                            </div>
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-800/80 text-gray-100 p-4 rounded-2xl">
                          正在思考...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="image" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-gray-400">图像生成功能敬请期待...</p>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-gray-400">语音合成功能敬请期待...</p>
              </div>
            </TabsContent>

            {/* 输入区域 */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="键入消息..."
                    className="bg-gray-900/50 border-gray-700 text-white resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={startListening}
                    disabled={isListening}
                    size="icon"
                    variant="outline"
                    className="bg-gray-900/50 border-gray-700 hover:bg-gray-800"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </PaymentCheck>
  );
};

export default Chat;
