
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
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">一次付费，终身使用</h2>
          </div>
          
          <div className="text-center mb-10">
            <div className="text-lg md:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              <p className="mb-4">
                <span className="text-gradient-gold font-bold text-2xl">只需 299元消费订阅机</span>
              </p>
              <p className="mb-4">
                <span className="font-bold">顶级模型集成体验</span>
              </p>
              <p className="mb-4">
                <span className="font-bold">集成Gemini 2.5、Claude 3.5、GPT-4o、DeepSeek R1等多款全球顶级AI模型</span>
              </p>
              <p className="mb-4">
                <span className="font-bold">创意无限可能</span>
              </p>
              <p className="text-white font-bold">
                文本创作、图像生成、语音合成，释放您的创造力
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
