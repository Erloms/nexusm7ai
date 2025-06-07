
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* 科技粒子特效背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black z-0"></div>
      
      {/* 动态粒子特效 */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='15' cy='15' r='0.5'/%3E%3Ccircle cx='45' cy='45' r='0.5'/%3E%3Ccircle cx='15' cy='45' r='0.3'/%3E%3Ccircle cx='45' cy='15' r='0.3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* 增强的动态光效 */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-cyan-500/10 to-blue-500/15 rounded-full blur-[100px] animate-pulse z-0"></div>
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-gradient-to-r from-purple-500/12 to-pink-500/10 rounded-full blur-[90px] animate-pulse z-0" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-1/4 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-indigo-500/8 to-cyan-500/12 rounded-full blur-[80px] animate-pulse z-0" style={{animationDelay: '2s'}}></div>
      
      {/* 科技线条特效 */}
      <div className="absolute inset-0 opacity-20 z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50h100M50 0v100' stroke='%2300d4ff' stroke-width='0.2' opacity='0.3'/%3E%3C/svg%3E")`
      }}></div>
      
      {/* 漂浮装饰元素 */}
      <div className="absolute top-1/3 left-1/6 w-2 h-2 bg-cyan-400/40 rounded-full animate-bounce z-0" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-2/3 right-1/6 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce z-0" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-purple-400/30 rounded-full animate-bounce z-0" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce z-0" style={{animationDelay: '2.2s'}}></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="inline-block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
              AI创作助手
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              三合一套餐
            </span>
          </h1>
          <h2 className="text-xl md:text-3xl font-semibold mb-8 text-white/90 drop-shadow-md">
            对话、创想、发声，一站搞定！
          </h2>
          <p className="text-base md:text-lg text-white/75 mb-8 max-w-3xl mx-auto leading-relaxed">
            体验前沿AI技术，释放无限创造力。从智能对话到艺术创作，从语音合成到图像生成，让AI成为你的创作伙伴。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-scale-in">
          <Button size="lg" asChild className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
            <Link to="/chat">
              <span className="relative z-10 flex items-center">
                🚀 立即体验
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </Button>
        </div>
        
        <button 
          onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
          className="animate-bounce flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mx-auto mt-12 hover:bg-white/20 transition-all duration-300 hover:scale-110 border border-white/20"
        >
          <ArrowDown size={28} className="text-white/80" />
        </button>
      </div>
      
      {/* 底部装饰渐变 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-gray-900/50 to-transparent z-0"></div>
      
      {/* 边缘光效 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
