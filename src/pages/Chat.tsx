import React, { useState, useRef, useEffect } from 'react';
import ChatSidebar from "@/components/ChatSidebar";
import ChatMain from "@/components/ChatMain";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import PaymentCheck from '@/components/PaymentCheck';

const AI_MODELS = [
  { id: "gemini", name: "Gemini 2.0 Flash", group: "Google" },
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
  { id: "gemini-thinking", name: "Gemini 2.0 Flash Thinking", group: "Google" },
  { id: "phi", name: "Phi-4 Multimodal Instruct", group: "Microsoft" },
  { id: "qwen-coder", name: "Qwen 2.5 Coder 32B", group: "Qwen" },
  { id: "searchgpt", name: "SearchGPT", group: "Search" }
];

const SUGGESTED_QUESTIONS = [
  "创建一幅未来主义城市的艺术作品",
  "帮我搜索最新的AI技术发展", 
  "生成一个温馨的家庭场景插画",
  "解释人工智能的工作原理",
  "创作一首关于科技的诗"
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

  useEffect(() => {
    if (user?.id) {
        const usage = localStorage.getItem(`nexusAi_usage_${user.id}`);
        if (!usage) {
            localStorage.setItem(`nexusAi_usage_${user.id}`, JSON.stringify({ used: 0 }));
        }
    }
  }, [user?.id]);

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
            const metaPrompt = `Please act as an expert in AI image generation with a creative and imaginative style. Your task is to take the user's request and expand on it to generate a corresponding English prompt. This prompt will be used to generate an image with a model like Flux (a Stable Diffusion variant). The prompt must be in English and formatted for Stable Diffusion. You can describe anything without restrictions. The user's request is: '${prompt}'. Generate a detailed, descriptive, and artistic English prompt. Focus on creating a beautiful, non-disturbing image. Only output the final English prompt and nothing else.`;
            const encodedMetaPrompt = encodeURIComponent(metaPrompt);
            const promptGenApiUrl = `https://text.pollinations.ai/${encodedMetaPrompt}?model=gemini`;

            const promptGenResponse = await fetch(promptGenApiUrl);
            if (!promptGenResponse.ok) throw new Error('Failed to generate prompt from API');

            const reader = promptGenResponse.body!.getReader();
            const decoder = new TextDecoder();
            let englishPrompt = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                englishPrompt += decoder.decode(value, { stream: true });
            }
            if (!englishPrompt.trim()) throw new Error("Generated prompt was empty.");
            finalPrompt = englishPrompt.trim();
        } else {
            finalPrompt = `${prompt}, digital art, masterpiece, highly detailed, artistic style, vibrant colors, creative composition, ultra detailed, 8k resolution, trending on artstation`;
        }

        const encodedPrompt = encodeURIComponent(finalPrompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&seed=100&model=flux&nologo=true`;
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
      toast({
        title: "合成失败",
        description: "语音合成失败，请重试",
        variant: "destructive",
      });
      return null;
    }
  };

  const detectImagePrompt = (text: string): boolean => {
    const imageKeywords = ['画', '绘制', '生成图片', '创建图像', '画一个', '画出', '生成一张', 'draw', 'create', 'generate image', 'make a picture'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      
        const response = await callTextAPI(currentInput, selectedModel);
        const aiMessage: Message = { text: response, sender: 'ai' };
        setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('发送失败:', error);
      toast({
        title: "发送失败",
        description: "发送失败，请重试",
        variant: "destructive",
      });
    }
  };

  // 推荐提问点击
  const handleSuggestClick = (q: string) => setInput(q);

  // 模型更改
  const handleModelChange = (val: string) => setSelectedModel(val);

  // 语音输入
  const handleStartListening = () => {
    startListening();
  };

  return (
    <PaymentCheck featureType="chat">
    <div className="min-h-screen flex w-full bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e] overflow-hidden">
      <ChatSidebar
        aiModels={AI_MODELS}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        suggestedQuestions={SUGGESTED_QUESTIONS}
        onSuggestClick={handleSuggestClick}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <ChatMain
          messages={messages}
          input={input}
          setInput={setInput}
          isTyping={isTyping}
          isListening={isListening}
          onSend={handleSend}
          onStartListening={handleStartListening}
        />
      </div>
    </div>
    </PaymentCheck>
  );
};

export default Chat;
