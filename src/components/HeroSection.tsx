
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MessageSquare, Image, Volume2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-black">
      {/* 星空背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900">
        {/* 动态星点 */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
                           radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px),
                           radial-gradient(circle at 80% 20%, white 0.3px, transparent 0.3px),
                           radial-gradient(circle at 20% 80%, white 0.6px, transparent 0.6px)`,
          backgroundSize: '800px 800px, 600px 600px, 400px 400px, 300px 300px, 500px 500px',
          opacity: 0.6
        }}></div>
      </div>

      {/* 浮动装饰图片 */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl transform rotate-12 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl transform -rotate-6 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg transform rotate-45 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-40 w-28 h-28 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl transform -rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              实时生成
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mt-4">
              人工智能操场
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            通过以下方式体验 AI 的强大功能，我们一个 generator一个explore
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center mb-16 animate-scale-in">
          <Button size="lg" asChild className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white text-lg px-12 py-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
            <Link to="/chat">
              <span className="relative z-10 flex items-center text-xl">
                ✨ 进入 Playground →
              </span>
            </Link>
          </Button>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
            <MessageSquare className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">互动聊天</h3>
            <p className="text-gray-400 text-sm">与AI助手互动，进行自然对话和创意内容生成</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
            <Image className="h-12 w-12 text-blue-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">图像生成</h3>
            <p className="text-gray-400 text-sm">利用AI最先进的图像生成功能，将您的想法转化为令人惊叹的视觉效果</p>
          </div>
          
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300">
            <Volume2 className="h-12 w-12 text-cyan-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">语音响应</h3>
            <p className="text-gray-400 text-sm">提出问题并接收来自AI的音频响应，带来更自然的交互体验</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
