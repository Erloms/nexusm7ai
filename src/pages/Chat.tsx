import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from "@/components/ChatSidebar";
import ChatMain from "@/components/ChatMain";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import PaymentCheck from '@/components/PaymentCheck';

const AI_MODELS = [
  { id: "gemini", name: "Gemini 2.0 Flash", group: "Google" },
  { id: "gemini-thinking", name: "Gemini 2.0 Flash Thinking", group: "Google" },
  { id: "openai", name: "OpenAI GPT-4o-mini", group: "OpenAI" },
  { id: "openai-large", name: "OpenAI GPT-4o", group: "OpenAI" },
  { id: "openai-reasoning", name: "OpenAI o1-mini", group: "OpenAI" },
  { id: "claude", name: "Claude 3.5 Haiku", group: "Anthropic" },
  { id: "claude-sonnet", name: "Claude 3.5 Sonnet", group: "Anthropic" },
  { id: "llama", name: "Llama 3.3 70B", group: "Meta" },
  { id: "llamalight", name: "Llama 3.1 8B Instruct", group: "Meta" },
  { id: "llama-vision", name: "Llama 3.2 Vision", group: "Meta" },
  { id: "deepseek", name: "DeepSeek-V3", group: "DeepSeek" },
  { id: "deepseek-r1", name: "DeepSeek-R1 Distill Qwen 32B", group: "DeepSeek" },
  { id: "deepseek-reasoner", name: "DeepSeek R1 - Full", group: "DeepSeek" },
  { id: "deepseek-r1-llama", name: "DeepSeek R1 - Llama 70B", group: "DeepSeek" },
  { id: "mistral", name: "Mistral Nemo", group: "Mistral" },
  { id: "mistral-large", name: "Mistral Large", group: "Mistral" },
  { id: "phi", name: "Phi-4 Multimodal Instruct", group: "Microsoft" },
  { id: "qwen-coder", name: "Qwen 2.5 Coder 32B", group: "Qwen" },
  { id: "qwen-math", name: "Qwen 2.5 Math", group: "Qwen" },
  { id: "yi-large", name: "Yi Large", group: "01.AI" },
  { id: "searchgpt", name: "SearchGPT", group: "Search" },
  { id: "perplexity", name: "Perplexity", group: "Search" }
];

// 聊天消息类型
type Message = {
  text: string;
  sender: "user" | "ai";
  type?: "text" | "image" | "audio";
  imageUrl?: string;
  audioUrl?: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();

  const getTotalUsage = () => {
    if (!user?.id) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_usage_${user.id}`) || '{"used": 0}');
    return usage.used;
  };

  const remainingUsage = 10 - getTotalUsage();

  const decrementTotalUsage = () => {
    if (!user?.id || checkPaymentStatus()) return true;
    
    if (remainingUsage <= 0) {
      toast({
        title: "额度用完",
        description: "您的总额度已用完，请升级VIP",
        variant: "destructive",
      });
      return false;
    }

    const currentUsed = getTotalUsage();
    localStorage.setItem(`nexusAi_usage_${user.id}`, JSON.stringify({ used: currentUsed + 1 }));

    return true;
  };

  // 保存聊天记录
  const saveChatHistory = (chatMessages: Message[]) => {
    if (!user?.id || chatMessages.length === 0) return;

    const chatHistory = {
      id: currentChatId || Date.now().toString(),
      title: chatMessages[0]?.text?.slice(0, 30) + '...' || '新对话',
      timestamp: new Date().toISOString(),
      preview: chatMessages[0]?.text?.slice(0, 100) + '...' || '',
      messages: chatMessages
    };

    const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
    const updatedHistory = [chatHistory, ...existingHistory.filter((h: any) => h.id !== chatHistory.id)];
    localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory.slice(0, 50))); // 最多保存50条记录
  };

  // 加载聊天记录
  const loadChatHistory = (historyId: string) => {
    if (!user?.id) return;

    const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
    const history = existingHistory.find((h: any) => h.id === historyId);
    
    if (history) {
      setMessages(history.messages);
      setCurrentChatId(historyId);
    }
  };

  // 新建对话
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setInput('');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    const currentInput = input;
    setInput('');

    try {
      // 检测是否为图像生成请求
      if (detectImagePrompt(currentInput)) {
        const imageUrl = await generateImage(currentInput, true);
        if (imageUrl) {
          const aiImageMessage: Message = { 
            text: `为您生成了图像：${currentInput}`, 
            sender: 'ai', 
            type: 'image',
            imageUrl: imageUrl 
          };
          const finalMessages = [...newMessages, aiImageMessage];
          setMessages(finalMessages);
          saveChatHistory(finalMessages);
        }
      } 
      // 检测是否为语音合成请求
      else if (/语音|朗读|播放|说出来/.test(currentInput)) {
        const response = await callTextAPI(currentInput, selectedModel);
        const aiMessage: Message = { text: response, sender: 'ai' };
        const messagesWithAI = [...newMessages, aiMessage];
        setMessages(messagesWithAI);
        
        // 自动合成语音
        await synthesizeVoice(response);
        saveChatHistory(messagesWithAI);
      }
      else {
        const response = await callTextAPI(currentInput, selectedModel);
        const aiMessage: Message = { text: response, sender: 'ai' };
        const finalMessages = [...newMessages, aiMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages);
      }
    } catch (error) {
      console.error('发送失败:', error);
      toast({
        title: "发送失败",
        description: "发送失败，请重试",
        variant: "destructive",
      });
    }
  };

  // 搜索功能
  const searchWeb = async (query: string): Promise<string> => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const searchUrl = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 提取搜索结果
      const results = data.RelatedTopics?.slice(0, 5)?.map((item: any) => item.Text)?.join('\n') || 
                    data.AbstractText || 
                    '未找到相关信息';
      
      return results;
    } catch (error) {
      console.error('搜索错误:', error);
      return '搜索服务暂时不可用，请稍后再试。';
    }
  };

  // 语音识别
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "不支持",
        description: "您的浏览器不支持语音识别",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setInput(result);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      toast({
        title: "识别失败",
        description: '语音识别失败: ' + event.error,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // 生成英文提示词
  const generateEnglishPrompt = async (chinesePrompt: string): Promise<string> => {
    try {
      const promptEnhancer = `Convert this Chinese description to a detailed English stable diffusion prompt with artistic style, composition, lighting, and quality keywords: "${chinesePrompt}". Output only the English prompt without any explanations.`;
      const encodedPrompt = encodeURIComponent(promptEnhancer);
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai`);
      
      if (response.ok) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let englishPrompt = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          englishPrompt += decoder.decode(value, { stream: true });
        }
        
        return englishPrompt.trim() || chinesePrompt;
      }
      return chinesePrompt;
    } catch (error) {
      console.error('提示词转换失败:', error);
      return chinesePrompt;
    }
  };

  const callTextAPI = async (prompt: string, modelId: string) => {
    if (!decrementTotalUsage()) return "额度不足";
    
    try {
      setIsTyping(true);
      
      // 检查是否需要搜索
      const shouldSearch = /搜索|查找|最新|新闻|当前|现在|今天|查询/.test(prompt) || selectedModel === 'searchgpt';
      
      let finalPrompt = prompt;
      
      if (shouldSearch) {
        const searchResults = await searchWeb(prompt);
        finalPrompt = `根据以下搜索结果回答问题：\n\n搜索结果：\n${searchResults}\n\n用户问题：${prompt}\n\n请基于搜索结果提供准确回答：`;
      }
      
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const apiUrl = `https://text.pollinations.ai/${encodedPrompt}${modelId ? '?model=' + modelId : ''}`;
      
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
      toast({
        title: "调用失败",
        description: "模型调用失败，请重试",
        variant: "destructive",
      });
      return "抱歉，我在处理您的请求时遇到了问题。请稍后再试。";
    } finally {
      setIsTyping(false);
    }
  };

  const generateImage = async (prompt: string, isFromChat: boolean) => {
    if (!decrementTotalUsage()) return null;

    try {
        let finalPrompt = prompt;
        
        if (isFromChat) {
            // 生成英文提示词
            finalPrompt = await generateEnglishPrompt(prompt);
        }

        // 添加高质量关键词
        const enhancedPrompt = `${finalPrompt}, masterpiece, best quality, highly detailed, ultra realistic, cinematic lighting, vibrant colors, professional photography, 8k resolution, award winning, trending on artstation`;
        
        // URL编码
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        
        // 使用Pollinations.ai API生成图像
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=${Math.floor(Math.random() * 1000000)}&model=flux&nologo=true`;
        
        console.log('生成图像URL:', imageUrl);
        console.log('原始提示词:', prompt);
        console.log('增强提示词:', enhancedPrompt);
        
        return imageUrl;

    } catch (error) {
        console.error("图像生成错误:", error);
        toast({
            title: "生成失败",
            description: "图像生成失败，请重试",
            variant: "destructive",
        });
        return null;
    }
  };

  const synthesizeVoice = async (text: string, voice: string = 'alloy') => {
    if (!decrementTotalUsage()) return null;
    
    try {
      // 限制文本长度，避免URL过长
      const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;
      const encodedText = encodeURIComponent(truncatedText);
      const audioUrl = `https://text.pollinations.ai/${encodedText}?model=openai-audio&voice=${voice}`;
      
      // 先测试音频是否可以加载
      const audio = new Audio();
      audio.onloadstart = () => {
        console.log('音频开始加载');
      };
      audio.oncanplay = () => {
        console.log('音频可以播放');
        audio.play().catch(err => {
          console.error('音频播放失败:', err);
          toast({
            title: "播放失败",
            description: "音频播放失败，请重试",
            variant: "destructive",
          });
        });
      };
      audio.onerror = (e) => {
        console.error('音频加载失败:', e);
        toast({
          title: "加载失败",
          description: "音频加载失败，请重试",
          variant: "destructive",
        });
      };
      
      audio.src = audioUrl;
      
      return audioUrl;
    } catch (error) {
      console.error("语音合成错误:", error);
      toast({
        title: "合成失败",
        description: "语音合成失败，请重试",
        variant: "destructive",
      });
      return null;
    }
  };

  const detectImagePrompt = (text: string): boolean => {
    const imageKeywords = ['画', '绘制', '生成图片', '创建图像', '画一个', '画出', '生成一张', 'draw', 'create', 'generate image', 'make a picture', '绘画', '创作', '插画', '图像'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  // 模型更改
  const handleModelChange = (val: string) => setSelectedModel(val);

  // 语音输入
  const handleStartListening = () => {
    startListening();
  };

  return (
    <PaymentCheck featureType="chat">
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e] overflow-hidden">
      <Navigation />
      <div className="flex flex-1 overflow-hidden pt-16">
        <div className="flex gap-4 p-4">
          <ChatSidebar
            aiModels={AI_MODELS}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            onLoadHistory={loadChatHistory}
            onNewChat={handleNewChat}
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0 ml-8">
          <ChatMain
            messages={messages}
            input={input}
            setInput={setInput}
            isTyping={isTyping}
            isListening={isListening}
            onSend={handleSend}
            onStartListening={handleStartListening}
            onSynthesizeVoice={synthesizeVoice}
          />
        </div>
      </div>
    </div>
    </PaymentCheck>
  );
};

export default Chat;
