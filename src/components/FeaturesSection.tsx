
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MessageSquare, Image, Mic } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: 'AI智能对话',
      description: '强大的AI聊天助手，可以回答问题、提供创意建议、编写文本，甚至帮您解决复杂问题。',
      icon: <MessageSquare className="h-12 w-12 text-nexus-blue" />,
      color: 'from-blue-500/20 to-cyan-400/20',
      hoverColor: 'from-blue-500/30 to-cyan-400/30',
      path: '/chat',
      buttonText: '开始对话'
    },
    {
      title: 'AI图像生成',
      description: '将你的想法转化为视觉艺术，只需输入文本描述，AI将为你创造令人惊叹的图像。',
      icon: <Image className="h-12 w-12 text-nexus-cyan" />,
      color: 'from-cyan-400/20 to-purple-500/20',
      hoverColor: 'from-cyan-400/30 to-purple-500/30',
      path: '/image',
      buttonText: '生成图像'
    },
    {
      title: 'AI语音合成',
      description: '将文本转换为自然流畅的语音，支持多种声音风格，适用于创作内容、教育材料或个人使用。',
      icon: <Mic className="h-12 w-12 text-nexus-accent" />,
      color: 'from-purple-500/20 to-pink-500/20',
      hoverColor: 'from-purple-500/30 to-pink-500/30',
      path: '/voice',
      buttonText: '转换语音'
    }
  ];
  
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="text-gradient">三大超能力</span>
          <span className="text-white">，一次拥有</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`card-glowing group p-6 flex flex-col items-center transition duration-300 hover:translate-y-[-5px]`}
            >
              <div className={`w-20 h-20 rounded-full mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} group-hover:${feature.hoverColor} transition duration-300 animate-float`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-white">{feature.title}</h3>
              
              <p className="text-white/70 text-center mb-8">
                {feature.description}
              </p>
              
              <div className="mt-auto">
                <Link to={feature.path}>
                  <Button 
                    className="bg-nexus-dark border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-blue hover:text-white transition-all"
                  >
                    {feature.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
