
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-20 z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexus-blue/10 rounded-full blur-[100px] z-0"></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="text-gradient">解锁</span> <span className="text-gradient-reverse">AI</span> <span className="text-gradient">超能力</span>
        </h1>
        <h2 className="text-2xl md:text-4xl font-bold mb-8">
          <span className="text-white">AI创作助手，智能高效，一键生成</span>
        </h2>
        
        {/* 核心亮点展示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-blue/20">
            <h3 className="text-lg font-bold text-nexus-cyan mb-2">顶级对话模型套装</h3>
            <p className="text-sm text-white/80">GPT-4o、Claude-3.5、DeepSeek-R1等顶级模型无限使用</p>
          </div>
          <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-blue/20">
            <h3 className="text-lg font-bold text-nexus-cyan mb-2">FLUX全家桶绘画</h3>
            <p className="text-sm text-white/80">Flux-Pro、Flux-Realism等专业绘画模型无限生成</p>
          </div>
          <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-blue/20">
            <h3 className="text-lg font-bold text-nexus-cyan mb-2">专业配音 + 代理分成</h3>
            <p className="text-sm text-white/80">AI语音合成 + 30%代理分成，多一份副业收入</p>
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          <span className="text-gradient-gold font-bold text-2xl">￥199/年</span> 或 <span className="text-gradient-gold font-bold text-2xl">￥799永久</span>
          <br/>
          <span className="font-bold">顶级AI模型触手可及，一次投资终身受益！</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild className="bg-nexus-blue hover:bg-nexus-blue/80 text-white text-lg px-8 py-6">
            <Link to="/chat">立即体验</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="bg-transparent border border-nexus-blue hover:bg-nexus-blue/20 text-nexus-blue text-lg px-8 py-6">
            <Link to="/payment">成为会员</Link>
          </Button>
        </div>
        
        <button 
          onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
          className="animate-bounce flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm mx-auto mt-8 hover:bg-white/20 transition"
        >
          <ArrowDown size={20} className="text-white" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
