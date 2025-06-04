
import React, { useState, useEffect } from 'react';
import { MessageCircle, Bot, User } from 'lucide-react';

const AIDemo = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const demoMessages = [
    { role: 'user', content: '请帮我写一首关于星空的诗' },
    { role: 'assistant', content: '夜空如墨洒星辰，\n银河璀璨照古今。\n月圆月缺皆有意，\n星光点点诉真心。' },
    { role: 'user', content: '能帮我生成一张宇宙星空的图片吗？' },
    { role: 'assistant', content: '当然可以！我正在为您生成一张浩瀚宇宙星空的图片，包含璀璨的星团、神秘的星云和深邃的太空...' },
    { role: 'user', content: '这个AI助手真的很强大！' },
    { role: 'assistant', content: '谢谢您的夸奖！我会继续努力为您提供更好的服务。无论是文本创作、图像生成还是语音合成，我都会全力以赴！' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % demoMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    const message = demoMessages[currentMessageIndex].content;
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex < message.length) {
        setDisplayedText(message.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex]);

  const currentMessage = demoMessages[currentMessageIndex];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI智能助手演示</h2>
          </div>
          <p className="text-white/70 text-lg">体验与AI的智能对话</p>
        </div>

        <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-6 rounded-2xl border border-nexus-blue/30 backdrop-blur-md">
          <div className="space-y-4 h-64 overflow-hidden">
            <div className="flex items-start space-x-3">
              {currentMessage.role === 'user' ? (
                <div className="bg-nexus-blue p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="bg-nexus-cyan p-2 rounded-full">
                  <Bot className="h-4 w-4 text-nexus-dark" />
                </div>
              )}
              <div className="flex-1">
                <div className={`p-4 rounded-lg ${
                  currentMessage.role === 'user' 
                    ? 'bg-nexus-blue/20 border border-nexus-blue/30' 
                    : 'bg-nexus-cyan/10 border border-nexus-cyan/20'
                }`}>
                  <p className="text-white whitespace-pre-line">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-2">
            {demoMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentMessageIndex ? 'bg-nexus-cyan' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemo;
