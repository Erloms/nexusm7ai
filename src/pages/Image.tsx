
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Download, ArrowLeft, Trash, RotateCcw, Video } from 'lucide-react';
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
];

const defaultNegativePrompt = "worst quality, low quality, blurry, out of focus, distorted, deformed, bad anatomy, watermark, signature, logo, text, copyright, trademark, artifacts, jpeg artifacts, noise, grain, pixelated, poor lighting, overexposed, underexposed, chinese text, asian text, chinese characters";

const Image: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(defaultNegativePrompt);
  const [model, setModel] = useState('flux');
  const [width, setWidth] = useState('1024');
  const [height, setHeight] = useState('768');
  const [seed, setSeed] = useState('-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [history, setHistory] = useState<Array<{image: string; title: string; model: string; prompt: string}>>([]);

  // 星空
  const starsRef = useRef<HTMLCanvasElement>(null);
  useStars(starsRef, "#1cdfff");

  // 生成优化的英文提示词
  const generateOptimizedPrompt = async (originalPrompt: string): Promise<string> => {
    try {
      const enhancerPrompt = `Convert this to a high-quality English stable diffusion prompt with artistic details, style specifications, and quality keywords. Input: "${originalPrompt}". Output only the optimized English prompt without explanations.`;
      const encodedPrompt = encodeURIComponent(enhancerPrompt);
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=openai`);
      
      if (response.ok) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let optimizedPrompt = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          optimizedPrompt += decoder.decode(value, { stream: true });
        }
        
        return optimizedPrompt.trim();
      }
      return originalPrompt;
    } catch (error) {
      console.error('提示词优化失败:', error);
      return originalPrompt;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "请输入详细的提示词", description: "提示词不能为空", variant: "destructive", });
      return;
    }
    
    setIsGenerating(true);
    try {
      // 优化提示词
      const optimizedPrompt = await generateOptimizedPrompt(prompt);
      
      // 添加高质量关键词和负面词
      const finalPrompt = `${optimizedPrompt}, masterpiece, best quality, highly detailed, ultra realistic, cinematic lighting, vibrant colors, professional photography, 8k resolution, award winning, trending on artstation`;
      
      // 构建完整的提示词，包含负面词
      const fullPrompt = negativePrompt ? 
        `${finalPrompt}. Negative prompt: ${negativePrompt}` : 
        finalPrompt;
      
      // URL编码
      const encodedPrompt = encodeURIComponent(fullPrompt);
      
      // 生成图像URL
      const finalSeed = seed === '-1' ? Math.floor(Math.random() * 1000000) : parseInt(seed);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${finalSeed}&model=${model}&nologo=true`;
      
      console.log('生成图像URL:', imageUrl);
      console.log('原始提示词:', prompt);
      console.log('优化后提示词:', optimizedPrompt);
      console.log('最终提示词:', fullPrompt);
      
      // 模拟生成时间
      await new Promise(res => setTimeout(res, 1500));
      
      setGeneratedImage(imageUrl);
      
      // 添加到历史记录
      const historyItem = { 
        image: imageUrl, 
        title: prompt, 
        model: modelOptions.find(m => m.id === model)?.name || model,
        prompt: optimizedPrompt
      };
      
      setHistory(prev => [historyItem, ...prev].slice(0, 12));
      
      toast({ title: "图片生成完成", description: "图片已成功生成" });
    } catch (error) { 
      console.error('生成失败:', error);
      toast({ title: "生成失败", description: "请重试", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const handleRedraw = async (originalPrompt: string, originalTitle: string) => {
    if (!originalPrompt && !originalTitle) return;
    
    const promptToUse = originalPrompt || originalTitle;
    setPrompt(promptToUse);
    
    setIsGenerating(true);
    try {
      const finalPrompt = `${originalPrompt || originalTitle}, masterpiece, best quality, highly detailed, ultra realistic, cinematic lighting, vibrant colors, professional photography, 8k resolution, award winning, trending on artstation`;
      const fullPrompt = negativePrompt ? 
        `${finalPrompt}. Negative prompt: ${negativePrompt}` : 
        finalPrompt;
      
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const newSeed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${newSeed}&model=${model}&nologo=true`;
      
      await new Promise(res => setTimeout(res, 1500));
      
      setGeneratedImage(imageUrl);
      
      const historyItem = { 
        image: imageUrl, 
        title: originalTitle || originalPrompt, 
        model: modelOptions.find(m => m.id === model)?.name || model,
        prompt: originalPrompt || originalTitle
      };
      
      setHistory(prev => [historyItem, ...prev].slice(0, 12));
      
      toast({ title: "重绘完成", description: "新图片已生成" });
    } catch (error) {
      console.error('重绘失败:', error);
      toast({ title: "重绘失败", description: "请重试", variant: "destructive" });
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
                    "美丽的山水风景，青山绿水，意境深远",
                    "宇宙星空，行星环绕，深邃神秘",
                    "森林中的精灵，梦幻光影，魔幻风格",
                    "现代建筑设计，简约时尚，几何美感",
                    "海边日落，金色沙滩，浪漫温馨",
                    "古典欧式城堡，石头建筑，历史厚重感"
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
                onClick={async () => {
                  if (prompt.trim()) {
                    const optimized = await generateOptimizedPrompt(prompt);
                    setPrompt(optimized);
                    toast({ title: "提示词已优化" });
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
              placeholder="不希望出现的内容"
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
              <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="width">宽度</label>
              <input
                type="number"
                className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
                value={width}
                min={256} max={2048}
                onChange={e => setWidth(e.target.value)}
                id="width"
              />
            </div>
            <div className="form-half flex-1">
              <label className="form-label block mb-2 text-[#96b7d4]" htmlFor="height">高度</label>
              <input
                type="number"
                className="form-input bg-[#14202c] border border-[#2e4258] text-white rounded-lg px-3 py-2"
                value={height}
                min={256} max={2048}
                onChange={e => setHeight(e.target.value)}
                id="height"
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
                className="rounded-xl border border-[#1cdfff88] max-h-[500px] mx-auto object-contain mb-5 shadow-lg transition cursor-pointer"
                onClick={() => setGeneratedImage(generatedImage)}
              />
              <div className="flex gap-2">
                <Button
                  className="bg-[#1cdfff] hover:bg-[#0ee4ff] text-[#17212c] px-4 font-bold rounded"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = `ai-image-${Date.now()}.png`;
                    link.click();
                    toast({ title: "图片文件下载已开始" });
                  }}
                >
                  <Download className="mr-1" size={16} /> 下载
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 font-bold rounded"
                  onClick={() => {
                    toast({ title: "图转视频功能开发中", description: "即将上线" });
                  }}
                >
                  <Video className="mr-1" size={16} /> 转视频
                </Button>
              </div>
            </div>
          ) : (
            <div className="preview-placeholder w-full h-[520px] flex items-center justify-center text-[#83a8c7] text-lg rounded-xl border border-dashed border-[#1cdfff33] bg-[#18222f]">
              点击"生成图像"开始创作
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
        <div className="history-list grid grid-cols-2 md:grid-cols-4 gap-6">
            {history.length === 0 ? (
              <div className="col-span-full text-[#83a8c7] text-center py-10 opacity-75">
                暂无历史记录
              </div>
            ) : history.map((item, idx) => (
              <div key={idx} className="history-item bg-[#17212c] rounded-lg p-3 flex flex-col items-center shadow relative">
                <img
                  className="history-image w-full h-40 rounded-lg mb-2 object-cover bg-[#1c222b] cursor-pointer transition-transform hover:scale-105"
                  src={item.image}
                  alt={item.title}
                  onClick={() => setGeneratedImage(item.image)}
                />
                <div className="history-item-title text-sm font-semibold mb-1 truncate w-full text-center text-white" title={item.title}>
                  {item.title}
                </div>
                <div className="history-item-model text-[#1cdfff] font-bold text-xs mb-2">{item.model}</div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-[#1cdfff] hover:bg-[#0ee4ff] text-[#17212c] px-2 py-1 text-xs"
                    onClick={() => handleRedraw(item.prompt, item.title)}
                  >
                    <RotateCcw className="mr-1" size={12} />
                    重绘
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 text-xs"
                    onClick={() => {
                      toast({ title: "图转视频功能开发中", description: "即将上线" });
                    }}
                  >
                    <Video className="mr-1" size={12} />
                    转视频
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Image;
