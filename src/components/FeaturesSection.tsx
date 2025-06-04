
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
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-8 md:p-12 rounded-2xl border border-nexus-blue/30 backdrop-blur-md">
          <div className="flex items-center justify-center mb-6">
            <Star className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">支持的模型</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 左侧：模型列表 */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-nexus-cyan mb-3">对话模型</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">GPT-4o</div>
                    <div className="text-white/70">OpenAI旗舰</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">Claude 3.5</div>
                    <div className="text-white/70">Anthropic最强</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">Gemini 2.0</div>
                    <div className="text-white/70">Google最新</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">DeepSeek R1</div>
                    <div className="text-white/70">推理专家</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-nexus-cyan mb-3">图像模型</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">FLUX Pro</div>
                    <div className="text-white/70">专业级</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">FLUX Dev</div>
                    <div className="text-white/70">开发版</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">FLUX Schnell</div>
                    <div className="text-white/70">快速版</div>
                  </div>
                  <div className="bg-nexus-dark/50 p-3 rounded-lg border border-nexus-blue/20">
                    <div className="font-bold text-white">FLUX Realism</div>
                    <div className="text-white/70">写实风格</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 右侧：宣传文案 */}
            <div className="text-center lg:text-left">
              <div className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                <p className="mb-4">
                  <span className="text-gradient-gold font-bold text-2xl">告别月月付费，拒绝年年涨价！</span>
                </p>
                <p className="mb-4">
                  <span className="font-bold">Nexus AI 只需799元，买断！终身！</span>
                </p>
                <p className="mb-4">
                  <span className="font-bold">GPT-4级对话、Gemini 2.0 Pro、DeepSeek R1...顶级大模型随便撩！</span>
                </p>
                <p className="mb-4">
                  <span className="font-bold">Flux全系列AI创作工具，无限畅用！</span>
                </p>
                <p className="text-white font-bold">
                  成年人不做选择，Nexus AI 让你全都要！
                </p>
              </div>
              
              <div className="text-center">
                <Button size="lg" asChild className="bg-nexus-blue hover:bg-nexus-blue/80 text-white text-lg px-8 py-4">
                  <Link to="/payment">立即升级会员</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
