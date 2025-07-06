
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Download, ArrowLeft, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';

// 星空动画
const useStars = (canvasRef: React.RefObject<HTMLCanvasElement>, color = "#1cdfff") => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = window.innerWidth,
        h = window.innerHeight;
    let stars: {
      x: number; y: number; r: number; o: number; twinkle: number;
    }[] = [];
    function resizeStars() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      stars = [];
      for (let i = 0; i < (w * h) / 1200; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.1 + 0.3,
          o: Math.random() * 0.7 + 0.3,
          twinkle: Math.random() * 2 * Math.PI
        });
      }
    }
    function drawStars() {
      ctx.clearRect(0,0,w,h);
      for (let s of stars) {
        ctx.save();
        ctx.globalAlpha = s.o + 0.30*Math.sin(Date.now()/700 + s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 7;
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(drawStars);
    }
    resizeStars();
    drawStars();
    window.addEventListener('resize', resizeStars);
    return () => window.removeEventListener('resize', resizeStars);
  }, [canvasRef, color]);
};

const modelOptions = [
  { id: 'flux', name: 'Flux (通用创意)', },
  { id: 'flux-pro', name: 'Flux Pro (专业版)', },
  { id: 'flux-realism', name: 'Flux Realism (超真实效果)', },
  { id: 'flux-anime', name: 'Flux Anime (动漫风格)', },
  { id: 'flux-3d', name: 'Flux 3D (三维效果)', },
  { id: 'flux-cablyai', name: 'Flux CablyAI (创意艺术)', },
  { id: 'turbo', name: 'Turbo (极速生成)', },
  { id: 'cogview-3-flash', name: 'CogView-3-Flash (智谱AI)', }
];

const defaultNegativePrompt = "worst quality, low quality, blurry, out of focus, distorted, deformed, bad anatomy, watermark, signature, logo, text, copyright, trademark, artifacts, jpeg artifacts, noise, grain, pixelated, poor lighting, overexposed, underexposed";
const staticHistory = [
  {
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "护卫队的机械光虎在夜色中巡逻",
    model: "FLUX",
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "X博士之谜机器人与气场守护狮",
    model: "Flux",
  },
  {
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "神盾守护者夜间霓虹守望，蓝色调",
    model: "Flux",
  },
  {
    image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=400&q=80",
    title: "白炉之王重燃的幻想机械守护虎",
    model: "Flux",
  },
  {
    image: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?auto=format&fit=crop&w=400&q=80",
    title: "一只孤独躺着的黑豹，镜头俯视",
    model: "FLUX PRO"
  },
  {
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    title: "一只黑豹躺了两次，镜头俯视",
    model: "FLUX PRO"
  },
  {
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "一只黑豹又躺了两次，镜头俯视",
    model: "FLUX 3D"
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "一只黑豹都睡不醒，镜头俯视",
    model: "FLUX 3D"
  }
];

const Image: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(defaultNegativePrompt);
  const [model, setModel] = useState('flux');
  const [width, setWidth] = useState('720');
  const [height, setHeight] = useState('1280');
  const [seed, setSeed] = useState('-1');
  const [safeMode, setSafeMode] = useState(true);
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [history, setHistory] = useState<Array<{image: string; title: string; model: string}>>([]);

  // 星空
  const starsRef = useRef<HTMLCanvasElement>(null);
  useStars(starsRef, "#1cdfff");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "请输入详细的提示词", description: "提示词不能为空", variant: "destructive", });
      return;
    }
    setIsGenerating(true);
    try {
      let imageUrl = '';
      
      if (model === 'cogview-3-flash') {
        // 对接智谱AI的CogView-3-Flash
        try {
          const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer 924d10ce4718479a9a089ffdc62aafff.d69Or12B5PEdYUco',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'cogview-3-flash',
              prompt: prompt,
              size: `${width}x${height}`
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            imageUrl = data.data[0].url;
          } else {
            throw new Error('CogView API调用失败');
          }
        } catch (error) {
          console.error('CogView API error:', error);
          // 降级到Pollinations API
          const encodedPrompt = encodeURIComponent(`${prompt}, ${negativePrompt ? `NOT: ${negativePrompt}` : ''}`);
          const randomSeed = seed === '-1' ? Math.floor(Math.random() * 100000) : seed;
          imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=flux&nologo=true`;
        }
      } else {
        // 使用Pollinations API
        const encodedPrompt = encodeURIComponent(`${prompt}, masterpiece, best quality, highly detailed, ultra realistic, ${negativePrompt ? `NOT: ${negativePrompt}` : ''}`);
        const randomSeed = seed === '-1' ? Math.floor(Math.random() * 100000) : seed;
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=${model}&nologo=true`;
      }
      
      await new Promise(res => setTimeout(res, 1200));
      setGeneratedImage(imageUrl);
      setHistory(prev => [{ image: imageUrl, title: prompt, model: modelOptions.find(m=>m.id===model)?.name || model }, ...prev].slice(0, 12));
      toast({ title: "图片生成完成" });
    } catch { 
      toast({ title: "生成失败", description: "请重试", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div style={{ minHeight: "calc(100vh - 64px)", background: "radial-gradient(ellipse at 25% 33%, #182d3d 0%, #101b26 100%)", position: "relative", paddingTop: "80px" }}>
        <canvas ref={starsRef} className="pointer-events-none fixed inset-0 w-full h-full z-0" />

      <div className="main-title"
        style={{
          textAlign: "center", fontSize: "2.6rem", fontWeight: 900, marginTop: 36, marginBottom: 6,
          letterSpacing: 2,
          background: "linear-gradient(90deg, #1cdfff 0%, #60aaff 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          userSelect: "none", fontFamily: "'Montserrat', 'PingFang SC', 'Microsoft YaHei', sans-serif"
        }}>
        AI绘画生成器
      </div>
      <div className="main-desc" style={{ textAlign: "center", color: "#7db7ea", fontSize: "1.1rem", marginBottom: 18, letterSpacing: "1.2px" }}>
        智能AI驱动的视觉增强创作平台
      </div>

      <div className="main-panel-wrap flex flex-col md:flex-row justify-center items-start gap-8 max-w-5xl mx-auto z-20 relative flex-wrap">

        {/* 左侧表单 */}
        <form className="panel bg-[#192735] rounded-xl border border-[#1cdfff33] p-7 min-w-[320px] max-w-[520px] flex-1 shadow" autoComplete="off"
          style={{ marginBottom: 0 }}>
          <div className="form-group mb-4">
            <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="prompt">提示词 (Prompt)</label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                className="bg-[#1cdfff] text-[#17212c] px-3 py-1 text-sm rounded font-medium"
                onClick={() => {
                  const randomPrompts = [
                    "一只可爱的小猫咪在花园里玩耍，阳光明媚",
                    "科幻城市夜景，霓虹灯闪烁，未来感十足",
                    "中国风山水画，水墨画风格，意境深远",
                    "宇宙星空，行星环绕，深邃神秘",
                    "森林中的精灵，梦幻光影，魔幻风格",
                    "现代建筑设计，简约时尚，几何美感"
                  ];
                  const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
                  setPrompt(randomPrompt);
                }}
              >
                随机提示词
              </Button>
              <Button
                type="button"
                className="bg-[#60aaff] text-white px-3 py-1 text-sm rounded font-medium"
                onClick={() => {
                  if (prompt.trim()) {
                    const enhancedPrompt = `${prompt}, masterpiece, best quality, highly detailed, ultra realistic, cinematic lighting, vibrant colors, professional photography, 8k resolution`;
                    setPrompt(enhancedPrompt);
                  }
                }}
              >
                优化提示词
              </Button>
            </div>
            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              id="prompt"
              placeholder="描述你希望生成的绘画内容..."
              className="form-textarea bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
              rows={4}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="negative_prompt">负面词 (Negative Prompt)</label>
            <Textarea
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2 w-full"
              placeholder="如不需要可留空"
              id="negative_prompt"
              rows={2}
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="model">模型选择</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="form-select bg-[#14202c] border border-[#2e4258] text-white rounded-lg h-11 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#14202c] border-[#2e4258] text-white">
                {modelOptions.map(opt =>
                  <SelectItem value={opt.id} key={opt.id}>
                    {opt.name}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="row flex gap-3 mb-4">
            <div className="form-half flex-1">
              <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="height">高度</label>
              <input
                type="number"
                className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
                value={height}
                min={128} max={2048}
                onChange={e => setHeight(e.target.value)}
                id="height"
              />
            </div>
            <div className="form-half flex-1">
              <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="width">宽度</label>
              <input
                type="number"
                className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
                value={width}
                min={128} max={2048}
                onChange={e => setWidth(e.target.value)}
                id="width"
              />
            </div>
          </div>
          <div className="form-group row flex gap-3 mb-4">
            <div className="form-half flex-1">
              <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="seed">种子值 (Seed)</label>
              <input
                type="text"
                value={seed}
                onChange={e => setSeed(e.target.value)}
                className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
                placeholder="-1 (随机)"
                id="seed"
              />
            </div>
            <Button
              type="button"
              className="form-seed-btn bg-[#14202c] text-[#1cdfff] border border-[#1cdfff] ml-2 mt-7 font-semibold"
              onClick={() => setSeed('-1')}
              style={{ padding: "6px 14px", borderRadius: 6 }}
            >随机</Button>
          </div>
          <div className="form-actions flex gap-4 mt-4">
            <Button
              disabled={isGenerating || !prompt.trim()}
              type="button"
              className="form-btn flex-1 bg-gradient-to-r from-[#1cdfff] to-[#60aaff] text-[#17212c] font-bold py-3 px-8 rounded-lg shadow-lg"
              style={{ letterSpacing: 1.8 }}
              onClick={handleGenerate}
            >
              {isGenerating ? '生成中…' : '🧠 生成图像'}
            </Button>
            <Button
              type="button"
              className="form-clear bg-transparent border border-[#264c5c] text-[#96b7d4] px-6 py-3 rounded-lg"
              onClick={() => {
                setPrompt('');
                setNegativePrompt(defaultNegativePrompt);
              }}
            >清空</Button>
          </div>
        </form>
        {/* 右边图片展示区域 */}
        <div className="preview-panel bg-[#192735] rounded-xl border border-[#1cdfff33] p-8 flex flex-col items-center min-h-[600px] max-w-[520px] min-w-[320px] flex-1 shadow">
          {generatedImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <img
                src={generatedImage}
                alt="生成图像"
                className="rounded-xl border border-[#1cdfff88] max-h-[500px] mx-auto object-contain mb-5 shadow-lg transition"
              />
              <Button
                className="bg-[#1cdfff] hover:bg-[#0ee4ff] text-[#17212c] px-5 font-bold rounded"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generatedImage;
                  link.download = 'ai-image.png';
                  link.click();
                  toast({ title: "图片文件下载已开始" });
                }}
              >
                <Download className="mr-1" /> 下载图片
              </Button>
            </div>
          ) : (
            <div className="preview-placeholder w-full h-[520px] flex items-center justify-center text-[#83a8c7] text-lg rounded-xl border border-dashed border-[#1cdfff33] bg-[#18222f]">
              点击“生成图像”快进到你的创作
            </div>
          )}
        </div>
      </div>
      {/* 历史记录 */}
      <div className="history-panel bg-[#192735] rounded-xl border border-[#1cdfff33] p-7 mt-10 max-w-6xl mx-auto z-20 relative">
        <div className="history-header flex justify-between items-center mb-4">
          <div className="history-title text-[#b6e8ff] text-lg font-bold tracking-wider">历史记录</div>
          <Button
            type="button"
            className="history-clear text-[#1cdfff] border border-[#1cdfff] rounded-md px-5 py-2 font-semibold hover:bg-[#1cdfff] hover:text-[#17212c] transition"
            onClick={() => setHistory([])}
          >
            <Trash className="mr-2" size={18} /> 清空历史
          </Button>
        </div>
        <div className="history-list grid grid-cols-2 md:grid-cols-4 gap-7">
            {history.length === 0 ? (
              <div className="col-span-full text-[#83a8c7] text-center py-10 opacity-75">
                暂无历史记录
              </div>
            ) : history.map((item, idx) => (
              <div key={idx} className="history-item bg-[#17212c] rounded-lg px-3 py-3 flex flex-col items-center shadow relative">
                <img
                  className="history-image w-full max-w-[150px] min-h-[120px] max-h-[130px] rounded-[9px] mb-2 object-cover bg-[#1c222b] cursor-pointer"
                  src={item.image}
                  alt={item.title}
                  onClick={() => setGeneratedImage(item.image)}
                />
                <div className="history-item-title text-sm font-semibold mb-1 truncate w-full text-center text-white">{item.title}</div>
                <div className="history-item-model text-[#1cdfff] font-bold text-xs mb-2">{item.model}</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-[#1cdfff] hover:bg-[#0ee4ff] text-[#17212c] px-2 py-1 text-xs"
                    onClick={() => {
                      setPrompt(item.title);
                      handleGenerate();
                    }}
                  >
                    重绘
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 text-xs"
                    onClick={() => {
                      // 图转视频功能 - 这里可以对接CogVideoX-Flash
                      toast({ title: "图转视频功能开发中", description: "即将上线", });
                    }}
                  >
                    转视频
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* 页脚 */}
      <footer className="footer text-center text-[#6e869a] text-sm opacity-80 select-none mt-7 mb-4 z-10">
        © 2025 Azad实验室出品　|　前方高能
      </footer>
      </div>
    </div>
  );
};

export default Image;
