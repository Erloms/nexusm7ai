
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 增强的背景元素 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/30 to-purple-900/40 z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent z-0"></div>
      
      {/* 动态背景光效 - 更多更美观的光效 */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-[120px] animate-pulse z-0"></div>
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-r from-purple-500/25 to-pink-500/25 rounded-full blur-[100px] animate-pulse z-0" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-[450px] h-[450px] bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-full blur-[90px] animate-pulse z-0" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-gradient-to-r from-teal-500/15 to-emerald-500/15 rounded-full blur-[80px] animate-pulse z-0" style={{animationDelay: '0.5s'}}></div>
      
      {/* 添加更多漂浮的装饰元素 */}
      <div className="absolute top-1/3 left-1/6 w-3 h-3 bg-cyan-400/80 rounded-full animate-bounce z-0" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-2/3 right-1/6 w-2 h-2 bg-blue-400/70 rounded-full animate-bounce z-0" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-purple-400/60 rounded-full animate-bounce z-0" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-400/50 rounded-full animate-bounce z-0" style={{animationDelay: '2.2s'}}></div>
      
      {/* 添加星空背景点缀 */}
      <div className="absolute inset-0 opacity-5 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">开启</span>{' '}
            <span className="text-gradient-reverse bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">AI</span>{' '}
            <span className="text-gradient bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">新时代</span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-8 text-white/90">
            对话、创想、发声，一站搞定！
          </h2>
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-3xl mx-auto">
            体验前沿AI技术，释放无限创造力。从智能对话到艺术创作，从语音合成到图像生成，让AI成为你的创作伙伴。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in">
          <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xl px-10 py-7 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
            <Link to="/chat">🚀 立即体验</Link>
          </Button>
        </div>
        
        <button 
          onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
          className="animate-bounce flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mx-auto mt-12 hover:bg-white/20 transition-all duration-300 hover:scale-110"
        >
          <ArrowDown size={24} className="text-white" />
        </button>
      </div>
      
      {/* 底部装饰波浪 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/80 to-transparent z-0"></div>
    </section>
  );
};

export default HeroSection;
