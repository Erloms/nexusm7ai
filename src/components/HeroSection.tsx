
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MessageSquare, Image, Volume2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center px-8 py-20 relative overflow-hidden min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* 星空背景 */}
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

      {/* 主要内容 */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-4">
        <div className="mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            探索未来 · 释放创造力
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Link to="/chat">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-12 border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 hover:bg-gray-900/80 hover:scale-105 cursor-pointer group">
              <MessageSquare className="h-16 w-16 text-cyan-400 mb-8 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-6">AI智能对话</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                强大的AI助手助您办理各种任务，可以回答问题、提供创意建议、编写文本，基于前沿深度学习技术构建，完全免费，无限制使用。
              </p>
              <div className="inline-block px-8 py-3 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors">
                开始对话
              </div>
            </div>
          </Link>

          <Link to="/image">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-12 border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 hover:bg-gray-900/80 hover:scale-105 cursor-pointer group">
              <Image className="h-16 w-16 text-pink-400 mb-8 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-6">AI图像生成</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                将您的想法转化为惊艳艺术，只需输入文本描述，AI将为您创造令人印象深刻的图像。支持多种风格和高分辨率导出。
              </p>
              <div className="inline-block px-8 py-3 bg-pink-500/20 border border-pink-400 rounded-lg text-pink-400 font-medium hover:bg-pink-500/30 transition-colors">
                生成图像
              </div>
            </div>
          </Link>

          <Link to="/voice">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-12 border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 hover:bg-gray-900/80 hover:scale-105 cursor-pointer group">
              <Volume2 className="h-16 w-16 text-purple-400 mb-8 mx-auto group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-white mb-6">AI语音合成</h3>
              <p className="text-gray-300 text-base leading-relaxed mb-8">
                文字转换为自然真实的语音，支持多种音色和语调，适用于创作内容、教育材料或个人使用。
              </p>
              <div className="inline-block px-8 py-3 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-400 font-medium hover:bg-purple-500/30 transition-colors">
                转换语音
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
