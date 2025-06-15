
import React from 'react';
import { Link } from 'react-router-dom';

// SVG ICONS仿真写法，实际可替换为lucide
const ChatIcon = (
  <div className="mb-5">
    <span className="inline-block bg-white/10 rounded-full p-3">
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#222A36"/><path d="M9 13.5c0-1.657 1.791-3 4-3h10c2.209 0 4 1.343 4 3v4c0 1.657-1.791 3-4 3H13.83l-4.265 2.897A.5.5 0 0 1 9 22.5V13.5Z" stroke="#4FF4FF" strokeWidth="2"/><circle cx="14" cy="17" r="1" fill="#4FF4FF"/><circle cx="18" cy="17" r="1" fill="#4FF4FF"/><circle cx="22" cy="17" r="1" fill="#4FF4FF"/></svg>
    </span>
  </div>
)
const PaintIcon = (
  <div className="mb-5">
    <span className="inline-block bg-white/10 rounded-full p-3">
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#222A36"/><ellipse cx="18" cy="15" rx="8" ry="5" fill="#FFC54B"/><ellipse cx="22.5" cy="18" rx="2.5" ry="1.5" fill="#61D6FE"/><ellipse cx="15.5" cy="19.5" rx="2" ry="1.2" fill="#FD6DFD"/><ellipse cx="12" cy="17" rx="1.2" ry="0.7" fill="#FFF"/></svg>
    </span>
  </div>
)
const VoiceIcon = (
  <div className="mb-5">
    <span className="inline-block bg-white/10 rounded-full p-3">
      <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><rect width="36" height="36" rx="18" fill="#222A36"/><rect x="13" y="11" width="10" height="13" rx="5" fill="#A961FE"/><rect x="16" y="25" width="4" height="2" rx="1" fill="#FFF"/><rect x="14" y="27" width="8" height="2" rx="1" fill="#61D6FE"/></svg>
    </span>
  </div>
)

const itemList = [
  {
    icon: ChatIcon,
    title: "AI智能对话",
    desc: "强大的AI聊天助手，可以回答问题、提供创造建议、编写文本，甚至帮你解决复杂问题。",
    btn: "开始对话",
    to: "/chat",
    border: "from-cyan-400 to-blue-400",
    btnColor: "bg-cyan-500 hover:bg-cyan-400"
  },
  {
    icon: PaintIcon,
    title: "AI图像生成",
    desc: "将你的想法转化为视觉艺术，只需输入文本描述，AI将为你创造令人惊艳的图像。",
    btn: "生成图像",
    to: "/image",
    border: "from-pink-400 to-pink-600",
    btnColor: "bg-pink-500 hover:bg-pink-400"
  },
  {
    icon: VoiceIcon,
    title: "AI语音合成",
    desc: "将文本转换为逼真的语音，支持多种风格，适合内容创作、教育材料或个人使用。",
    btn: "转换语音",
    to: "/voice",
    border: "from-purple-400 to-indigo-400",
    btnColor: "bg-purple-500 hover:bg-purple-400"
  }
]

const HeroSection = () => {
  return (
    <section className="flex flex-col items-center justify-center px-8 py-24 min-h-screen relative bg-[#101624]">
      {/* 星空背景+炫彩渐变 */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#232946]/80 via-[#181e2e]/90 to-[#232946]/70">
        <div className="absolute inset-0 opacity-30" style={{
          background: `
            radial-gradient(circle at 20% 30%, #36eaff33 0%, transparent 60%),
            radial-gradient(circle at 80% 10%, #fd6dfd40 0%, transparent 70%),
            radial-gradient(circle at 60% 80%, #a961fe33 0%, transparent 65%),
            repeating-linear-gradient(195deg,rgba(255,255,255,0.08) 0px,rgba(255,255,255,0.07) 6px,transparent 7px,transparent 20px)
          `,
          backgroundSize: '1200px 600px,1000px 800px,1100px 600px,100% 100%'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        <h1 className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent font-black text-6xl md:text-7xl tracking-tight mb-4 animate-fade-in-down">
          探索未来<span className="mx-5 text-white/50">·</span>释放创造力
        </h1>
        <div className="flex items-center max-w-[900px] mx-auto gap-10 mt-14 justify-center flex-col md:flex-row">
          {itemList.map(item => (
            <div key={item.title}
              className={`relative bg-[#181f32] border-2 border-transparent hover:border-cyan-400 rounded-3xl shadow-xl hover:scale-105 transition-all duration-300 px-9 py-8 flex-1 min-w-[300px] max-w-[360px] group`}
              style={{
                boxShadow: `0 4px 32px rgba(80,222,255,0.06)`,
                borderImage: `linear-gradient(90deg, var(--tw-gradient-from), var(--tw-gradient-to)) 1`,
                backgroundImage: `linear-gradient(90deg, #20293C 0%, #191F30 100%)`
              }}
            >
              <div className={`absolute left-0 right-0 top-0 h-1 rounded-tr-3xl rounded-tl-3xl bg-gradient-to-r ${item.border}`} />
              <div className="flex flex-col items-center h-full relative z-10">
                {item.icon}
                <h2 className="font-extrabold text-xl tracking-wide text-white mb-3">{item.title}</h2>
                <div className="text-gray-400 text-base mb-8 min-h-[56px]">{item.desc}</div>
                <Link to={item.to}
                      className={`rounded-xl font-semibold px-7 py-2 text-base text-white shadow-lg transition-all duration-200 ${item.btnColor}`}>
                  {item.btn}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="mt-24 opacity-70 select-none z-10">
        <div className="text-gray-400 text-xs">
          © 2025 Azad实验室 | 基于 Pollinations.AI | 体验终极AI创造
        </div>
      </footer>
    </section>
  );
};

export default HeroSection;
