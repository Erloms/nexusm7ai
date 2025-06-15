
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// 彩色渐变
const GRADIENT = "from-cyan-400 via-pink-400 to-purple-500";

const icons = [
  // 聊天
  (
    <span className="text-4xl" aria-label="chat" role="img">
      💬
    </span>
  ),
  // 画笔
  (
    <span className="text-4xl" aria-label="palette" role="img">
      🎨
    </span>
  ),
  // 音量
  (
    <span className="text-4xl" aria-label="sound" role="img">
      🔊
    </span>
  ),
];

const cardCfg = [
  {
    title: "AI智能对话",
    desc:
      "强大的AI聊天助手，可以回答问题、提供创意建议、编写文本，甚至帮你解决复杂问题。完全免费，无限制使用。",
    btn: "开始对话",
    to: "/chat",
    border: "from-cyan-400 to-cyan-300",
    btnFg: "text-cyan-300 border-cyan-300 hover:bg-cyan-300 hover:text-[#181a2e]",
    icon: icons[0],
  },
  {
    title: "AI图像生成",
    desc:
      "将你的想法转化为视觉艺术。只需输入文本描述，AI将为你创造令人惊叹的图像。支持多种风格和高分辨率导出。",
    btn: "生成图像",
    to: "/image",
    border: "from-pink-400 to-pink-500",
    btnFg: "text-pink-400 border-pink-400 hover:bg-pink-400 hover:text-white",
    icon: icons[1],
  },
  {
    title: "AI语音合成",
    desc:
      "将文本转换为逼真的语音。支持多种语言和声音风格，适用于创作内容、教育材料或个人使用。",
    btn: "转换语音",
    to: "/voice",
    border: "from-purple-400 to-purple-500",
    btnFg: "text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white",
    icon: icons[2],
  },
];

const useClock = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    const tick = () => {
      const now = new Date();
      setTime(
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
};

const HeroSection = () => {
  // 星空背景使用canvas
  const starsCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = starsCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = window.innerWidth,
      h = window.innerHeight;
    let stars: {
      x: number;
      y: number;
      r: number;
      o: number;
      twinkle: number;
    }[] = [];

    function resizeStars() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      stars = [];
      for (let i = 0; i < (w * h) / 1200; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          o: Math.random() * 0.7 + 0.3,
          twinkle: Math.random() * 2 * Math.PI,
        });
      }
    }
    function drawStars() {
      ctx.clearRect(0, 0, w, h);
      for (let s of stars) {
        ctx.save();
        ctx.globalAlpha = s.o + 0.3 * Math.sin(Date.now() / 700 + s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#18ffff";
        ctx.shadowColor = "#18ffff";
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(drawStars);
    }
    resizeStars();
    drawStars();
    window.addEventListener("resize", resizeStars);
    return () => {
      window.removeEventListener("resize", resizeStars);
    };
  }, []);

  const time = useClock();

  return (
    <section className="relative min-h-screen flex flex-col items-center bg-[#0e1020] overflow-x-hidden">
      {/* 星空背景 */}
      <canvas
        ref={starsCanvas}
        className="pointer-events-none fixed inset-0 w-full h-full z-0"
        data-astro-canvas
        style={{ zIndex: 1 }}
      />
      {/* 顶部时钟 */}
      <div
        className="absolute top-8 right-12 text-sm px-6 py-1.5 rounded-md border border-cyan-300 bg-cyan-300/5 text-cyan-200 font-mono shadow z-10 select-none animate-fade-in"
        style={{ letterSpacing: "0.15em" }}
      >
        {time}
      </div>
      {/* 语言切换按钮 (做装饰) */}
      <div
        className="fixed right-6 top-[48%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border-2 border-cyan-300 text-cyan-400 flex items-center justify-center text-base shadow cursor-pointer select-none"
        title="语言"
        style={{ fontFamily: "inherit" }}
      >
        𐰴
      </div>
      {/* 主标题和副标题 */}
      <header className="mt-20 md:mt-24 mb-4 text-center z-10 relative">
        <div
          className="font-black text-4xl md:text-6xl bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent tracking-widest"
          style={{
            fontFamily:
              "'Montserrat', 'PingFang SC', 'Microsoft YaHei', sans-serif",
            letterSpacing: 6,
            userSelect: "none",
          }}
        >
          Nexus AI
        </div>
        <div
          className="text-lg md:text-2xl font-medium text-[#d1d5fa] tracking-wide mt-3 mb-5 inline-block relative animate-fade-in"
        >
          探索未来　·　释放创造力
          {/* 渐变横线分割 */}
          <div className="w-[60%] h-1 mx-auto mt-3 rounded bg-gradient-to-r from-cyan-300 to-pink-400"></div>
        </div>
      </header>
      {/* 主要卡片布局 */}
      <div className="main-cards flex flex-col md:flex-row justify-center items-stretch gap-7 md:gap-[2.7rem] mt-10 mb-16 z-10 relative w-full max-w-7xl px-3 ">
        {cardCfg.map((cfg, i) => (
          <div
            key={cfg.title}
            className={`
              relative bg-[rgba(20,22,46,0.98)] rounded-[22px] shadow-2xl border-2 border-transparent transition-all duration-200
              min-w-[290px] max-w-[400px] flex-1 px-8 py-10
              before:absolute before:inset-0 before:z-0
              ${i === 0
                ? "border-gradient-card-cyan"
                : i === 1
                ? "border-gradient-card-pink"
                : "border-gradient-card-purple"
              }
              group
              hover:scale-[1.03] hover:shadow-[0_8px_44px_0_rgba(24,255,255,0.20),_0_2px_24px_0_rgba(255,60,142,0.13)]
            `}
            style={{
              borderImage: `linear-gradient(90deg, ${
                i === 0
                  ? "#18ffff 0%,#54bfff 100%"
                  : i === 1
                  ? "#ff3c8e 0%,#ff73cc 100%"
                  : "#a259ff 0%,#60f 100%"
              }) 1`,
              boxShadow:
                "0 4px 32px 0 rgba(24,255,255,0.10), 0 1.5px 8px 0 rgba(255,60,142,0.08)",
              zIndex: 2,
            }}
          >
            <div className="relative z-10 flex flex-col">
              <div className="card-icon mb-3 flex items-center justify-start">{cfg.icon}</div>
              <div className="card-title flex items-center mb-4 text-white text-xl md:text-2xl font-extrabold">
                <strong className="font-black text-2xl md:text-3xl mr-2">AI</strong> {cfg.title.replace("AI", "")}
              </div>
              <div className="card-desc text-[1.05rem] text-[#c3c6e4] leading-7 mb-8 min-h-[62px]">
                {cfg.desc}
              </div>
              <Link to={cfg.to} className={`card-btn font-bold text-base border transition px-7 py-2.5 rounded-lg shadow-sm ${cfg.btnFg}`}>
                {cfg.btn}
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* 彩色浮动侧边栏，仅装饰用 */}
      <div className="hidden md:flex fixed right-7 bottom-24 flex-col items-end gap-6 z-10">
        <button className="side-btn w-10 h-10 rounded-full bg-[#181a2e] border-2 border-cyan-300 flex items-center justify-center shadow text-cyan-400 text-xl hover:bg-cyan-300 hover:text-[#181a2e] hover:border-pink-400 transition" title="帮助">?</button>
        <button className="side-btn w-10 h-10 rounded-full bg-[#181a2e] border-2 border-cyan-300 flex items-center justify-center shadow text-cyan-400 text-xl hover:bg-cyan-300 hover:text-[#181a2e] hover:border-pink-400 transition" title="设置">⚙️</button>
        <button className="side-btn w-10 h-10 rounded-full bg-[#181a2e] border-2 border-cyan-300 flex items-center justify-center shadow text-cyan-400 text-xl hover:bg-cyan-300 hover:text-[#181a2e] hover:border-pink-400 transition" title="反馈">✉️</button>
      </div>
      {/* 底部版权，不显示model出处 */}
      <footer className="footer text-center text-[#6e7088] text-base relative z-20 mt-8 mb-4 select-none">
        © 2025 <span className="text-cyan-400 font-bold">Nexus AI</span>
        <span className="mx-2">|</span>
        Azad的实验室
      </footer>
    </section>
  );
};

export default HeroSection;
