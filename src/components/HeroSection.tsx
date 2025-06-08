
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MessageSquare, Image, Volume2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative overflow-hidden bg-gradient-to-br from-purple-950 via-black to-blue-950">
      {/* 增强的星空背景 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(119, 198, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, white 0.5px, transparent 0.5px),
            radial-gradient(circle at 50% 50%, white 0.8px, transparent 0.8px)
          `,
          backgroundSize: '800px 800px, 600px 600px, 400px 400px, 800px 800px, 600px 600px, 400px 400px',
          opacity: 0.6
        }}></div>
      </div>

      {/* 浮动装饰元素 */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl transform rotate-12 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-xl transform -rotate-6 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg transform rotate-45 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-40 w-28 h-28 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl transform -rotate-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>

      {/* 主要内容 - 调整间距 */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-4">
        <div className="mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              头尔生成
            </span>
            <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mt-6 text-2xl md:text-4xl">
              人工智能操场
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            通过以下方式体验 AI 的强大功能
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-scale-in">
          <Button size="lg" asChild className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white text-lg px-10 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0">
            <Link to="/chat">
              <span className="relative z-10 flex items-center text-xl">
                ✨ 进入 Playground →
              </span>
            </Link>
          </Button>
        </div>

        {/* 功能卡片 - 增加上方空白距离 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-900/60">
            <MessageSquare className="h-10 w-10 text-purple-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">互动聊天</h3>
            <p className="text-gray-400 text-sm">与AI助手互动，进行自然对话和创意内容生成</p>
          </div>
          
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-900/60">
            <Image className="h-10 w-10 text-blue-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">图像生成</h3>
            <p className="text-gray-400 text-sm">利用AI最先进的图像生成功能，将您的想法转化为令人惊叹的视觉效果</p>
          </div>
          
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/30 hover:border-cyan-500/50 transition-all duration-300 hover:bg-gray-900/60">
            <Volume2 className="h-10 w-10 text-cyan-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-white mb-2">语音响应</h3>
            <p className="text-gray-400 text-sm">提出问题并接收来自AI的音频响应，带来更自然的交互体验</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
