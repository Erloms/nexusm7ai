
import React from 'react';
import { MessageSquare, Palette, Mic, Bot, Zap, Shield } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-nexus-dark to-nexus-darker relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/lovable-uploads/grid-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            强大的AI能力集合
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            集成多种顶级AI模型，为您提供全方位的智能创作体验
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-gradient-to-br from-nexus-card to-nexus-card-dark p-8 rounded-2xl border border-nexus-accent/20 hover:border-nexus-accent/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-r from-nexus-accent to-nexus-secondary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">智能对话</h3>
            <p className="text-gray-300 leading-relaxed">
              支持20+顶级AI模型，包括GPT-4、Claude、Gemini等，提供专业的对话体验
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-nexus-card to-nexus-card-dark p-8 rounded-2xl border border-nexus-accent/20 hover:border-nexus-accent/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-r from-nexus-accent to-nexus-secondary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">AI绘画</h3>
            <p className="text-gray-300 leading-relaxed">
              集成Flux、DALL-E等顶级绘画模型，支持多种风格的图像生成
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-nexus-card to-nexus-card-dark p-8 rounded-2xl border border-nexus-accent/20 hover:border-nexus-accent/40 transition-all duration-300 group">
            <div className="w-12 h-12 bg-gradient-to-r from-nexus-accent to-nexus-secondary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">语音合成</h3>
            <p className="text-gray-300 leading-relaxed">
              支持多种语音模型，生成自然流畅的语音内容
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center p-6 bg-nexus-card/30 rounded-xl border border-nexus-accent/10">
            <Bot className="w-8 h-8 text-nexus-accent mr-4" />
            <div>
              <h4 className="text-white font-semibold">20+ AI模型</h4>
              <p className="text-gray-400 text-sm">多样化选择</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-6 bg-nexus-card/30 rounded-xl border border-nexus-accent/10">
            <Zap className="w-8 h-8 text-nexus-accent mr-4" />
            <div>
              <h4 className="text-white font-semibold">极速响应</h4>
              <p className="text-gray-400 text-sm">毫秒级处理</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center p-6 bg-nexus-card/30 rounded-xl border border-nexus-accent/10">
            <Shield className="w-8 h-8 text-nexus-accent mr-4" />
            <div>
              <h4 className="text-white font-semibold">安全可靠</h4>
              <p className="text-gray-400 text-sm">企业级安全</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
