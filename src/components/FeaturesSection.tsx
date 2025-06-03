
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-10 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-nexus-cyan/10 rounded-full blur-[80px] z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-8 md:p-12 rounded-2xl border border-nexus-blue/30 backdrop-blur-md">
          <div className="flex items-center justify-center mb-6">
            <Star className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI智能助手，助您高效创作</h2>
          </div>
          
          {/* 核心价值主张 */}
          <div className="text-center mb-10">
            <div className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              <p className="mb-4">
                <span className="font-bold text-gradient-gold">告别月月付费，拒绝年年涨价！</span>
              </p>
              <p className="mb-4">
                <span className="text-gradient-gold font-bold text-2xl">Nexus AI 只需799元，买断！终身！</span> 
                <span className="text-white"> 并享有30%代理分成收益，多一份副业收入。</span>
              </p>
              <p className="mb-4">
                <span className="font-bold">GPT-4级对话、Gemini 2.0 Pro、DeepSeek R1，Claude...顶级大模型随便撩！</span>
              </p>
              <p className="mb-4">
                <span className="font-bold">Flux全系列AI创作工具，无限畅用！</span>
              </p>
              <p className="text-gradient font-bold text-xl">
                成年人不做选择，Nexus AI 让你全都要！
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gradient-gold mb-4">价格优势</h3>
              <p className="text-white/80 mb-4">
                无需为昂贵的大模型付费，只需 <span className="text-gradient-gold font-bold text-xl">799元永久使用</span> 顶尖AI模型
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gradient-gold mb-4">功能全面</h3>
              <p className="text-white/80 mb-4">
                集成文本生成、图像创作与语音合成于一体，满足您所有AI创作需求
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gradient-gold mb-4">持续更新</h3>
              <p className="text-white/80 mb-4">
                我们不断引入最新的AI模型，确保您始终用着最前沿的人工智能技术
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild className="bg-nexus-blue hover:bg-nexus-blue/80 text-white text-lg px-8 py-4 mr-4">
              <Link to="/payment">立即升级会员</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
