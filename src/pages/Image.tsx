
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Download, ArrowLeft, Trash } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Link } from 'react-router-dom';

// 深色背景全局设定
const rootBgClass = "min-h-screen w-full bg-[#101b26] pb-12";

const cardBgClass = "bg-[#16212f] rounded-2xl shadow-2xl border-none";
const sectionGap = "gap-8 md:gap-14";

const textGradient = "bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent";
const descText = "text-gray-400 text-base mb-0";

const inputLabelClass = "block mb-1 text-sm font-semibold text-gray-200";
const inputWrapClass = "mb-4";
const inputClass = "bg-[#101b26] border border-[#28374e] text-gray-200 placeholder-gray-400 rounded-lg px-4 py-3 focus:border-cyan-400 transition outline-none w-full";
const selectTriggerClass = "bg-[#101b26] border border-[#28374e] text-gray-200 rounded-lg h-11 px-2";
const selectContentClass = "bg-[#131c27] border-[#24304d]";
const seedBtnClass = "bg-[#0d253a] text-cyan-400 border-none rounded-lg px-5 h-11 hover:bg-cyan-900/60 font-semibold shadow-none";

const checkClass = "appearance-none w-5 h-5 rounded border border-[#2e415b] bg-[#192936] checked:bg-cyan-500 checked:border-cyan-500 transition shadow focus:ring-0 focus:outline-none mr-2";
const checkText = "text-gray-300 text-sm mr-6 select-none flex items-center";
const mainBtnClass = "h-12 px-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold shadow-lg hover:from-cyan-500 hover:to-blue-700 transition";
const clearBtnClass = "h-12 px-8 rounded-lg bg-gray-700 text-gray-100 shadow hover:bg-gray-600";

const historyLabel = "text-xl text-gray-200 font-bold mb-5";
const historyCard = "bg-[#16212f] rounded-2xl shadow-lg border-none px-6 py-8";

const modelOptions = [
  { id: 'flux', name: 'Flux 通用创意', desc: "多场景与风格通用", },
  { id: 'flux-pro', name: 'Flux Pro 专业版', desc: "更高画质与细节", },
  { id: 'flux-realism', name: 'Flux Realism 超真实感', desc: "写实/仿真", },
  { id: 'flux-anime', name: 'Flux Anime 动漫风', desc: "二次元/卡通", },
  { id: 'flux-3d', name: 'Flux 3D 三维效果', desc: "立体建模", },
  { id: 'flux-cablyai', name: 'Flux CablyAI 艺术创意', desc: "独特艺术", },
  { id: 'turbo', name: 'Turbo 极速生成', desc: "快速出图", },
];

const defaultNegativePrompt = "worst quality, blurry";

const Image: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(defaultNegativePrompt);
  const [model, setModel] = useState('flux');
  const [width, setWidth] = useState('1024');
  const [height, setHeight] = useState('1024');
  const [seed, setSeed] = useState('-1');
  const [safeMode, setSafeMode] = useState(true);
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [history, setHistory] = useState<Array<{
    id: number, prompt: string, image: string, model: string
  }>>([]);

  // 同步截图:宽度、行高、控件间距、按钮/输入圆角都以截图为准

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入详细的提示词",
        description: "提示词不能为空",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);

    try {
      // 拼接prompt
      const fullPrompt = `${prompt}${negativePrompt ? `, ${negativePrompt}` : ''}`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const randomSeed = seed === '-1' ? Math.floor(Math.random() * 100000) : seed;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=${model}&nologo=true`;

      await new Promise(res => setTimeout(res, 1200));
      setGeneratedImage(imageUrl);

      // 保存历史
      setHistory(prev => [{id: Date.now(), prompt, model, image: imageUrl}, ...prev].slice(0, 12));
      toast({ title: "图片生成完成" });
    } catch { }
    setIsGenerating(false);
  };

  // 卡片布局，用CSS实现两栏区隔+卡片高宽一致
  return (
    <div className={rootBgClass}>
      <Navigation />
      <div className="max-w-7xl mx-auto pt-16 md:pt-20">
        {/* 顶部标题及返回 */}
        <div className="flex justify-between items-center mb-8">
          <div />
          <div>
            <h1 className={`text-4xl md:text-5xl font-black pb-2 text-center ${textGradient}`}>
              Free AI绘画生成器
            </h1>
            <div className="text-center text-gray-400 tracking-wide mb-2">
              基于 Pollinations.AI 的高效深度图像生成系统
            </div>
          </div>
          <Button asChild className="bg-gradient-to-r from-cyan-700 to-blue-800 text-white font-bold px-6 py-2 rounded-lg shadow ml-auto">
            <Link to="/">
              <ArrowLeft className="inline-block mr-1" /> 返回首页
            </Link>
          </Button>
        </div>
        {/* 主卡片区 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${sectionGap} mb-12`}>
          {/* 左侧控件 */}
          <Card className={cardBgClass + ' p-8'}>
            <CardContent className="p-0">
              <form
                onSubmit={e => { e.preventDefault(); handleGenerate(); }}
                autoComplete="off"
              >
                <div className={inputWrapClass}>
                  <label className={inputLabelClass}>提示词 (Prompt)</label>
                  <Textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="建议详细描述你想要生成的图像内容…"
                    className={inputClass + " min-h-[70px] mb-2"}
                    rows={4}
                  />
                  <div className="text-gray-500 text-xs mb-1">
                    如：日落海滩、猫咪穿太空服写实风格，最佳在50字以上，多描述场景/主体/细节/风格/气氛。
                  </div>
                </div>
                <div className={inputWrapClass}>
                  <label className={inputLabelClass}>负面词 (Negative Prompt)</label>
                  <input
                    value={negativePrompt}
                    onChange={e => setNegativePrompt(e.target.value)}
                    className={inputClass}
                    placeholder="如不需要可留空"
                  />
                  <div className="text-gray-500 text-xs mt-1">
                    负面词会抑制相关内容：如去除模糊、低质量。多个英文逗号分隔。
                  </div>
                </div>
                <div className={inputWrapClass}>
                  <label className={inputLabelClass}>模型选择</label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selectContentClass + " text-gray-200"}>
                      {modelOptions.map(opt =>
                        <SelectItem value={opt.id} key={opt.id} className="hover:bg-[#203050] focus:bg-cyan-800/40">
                          <div className="flex flex-col">
                            <span className="font-semibold">{opt.name}</span>
                            <span className="text-xs text-gray-500">{opt.desc}</span>
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className={inputLabelClass}>宽度</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={width}
                      min={256} max={2048}
                      onChange={e => setWidth(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={inputLabelClass}>高度</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={height}
                      min={256} max={2048}
                      onChange={e => setHeight(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className={inputLabelClass}>种子数 (Seed)</label>
                    <input
                      type="text"
                      value={seed}
                      onChange={e => setSeed(e.target.value)}
                      className={inputClass}
                      placeholder="-1 (随机)"
                    />
                  </div>
                  <Button
                    type="button"
                    className={seedBtnClass + " self-end mt-7"}
                    onClick={() => setSeed('-1')}
                  >
                    随机
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-5 mb-7 mt-1">
                  <label className={checkText}>
                    <input
                      type="checkbox"
                      className={checkClass}
                      checked={removeWatermark}
                      onChange={e => setRemoveWatermark(e.target.checked)}
                    />
                    移除水印
                  </label>
                  <label className={checkText}>
                    <input
                      type="checkbox"
                      className={checkClass}
                      checked={safeMode}
                      onChange={e => setSafeMode(e.target.checked)}
                    />
                    安全模式（过滤不良内容）
                  </label>
                </div>
                <div className="flex gap-4">
                  <Button
                    disabled={isGenerating || !prompt.trim()}
                    type="submit"
                    className={mainBtnClass + " flex-1"}
                  >
                    {isGenerating ? '生成中…' : '生成图像'}
                  </Button>
                  <Button
                    type="button"
                    className={clearBtnClass}
                    onClick={() => {
                      setPrompt('');
                      setNegativePrompt(defaultNegativePrompt);
                    }}
                  >
                    清空
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 右：预览图区域 */}
          <Card className={cardBgClass + ' flex items-center justify-center min-h-[350px] h-full'}>
            <CardContent className="flex flex-col w-full h-full justify-center items-center p-0">
              {generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={generatedImage}
                    alt="生成图像"
                    className="rounded-xl border border-[#243553] max-h-[450px] mx-auto object-contain mb-5 shadow-lg"
                  />
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-5"
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
                <div className="text-gray-500 flex flex-col items-center justify-center h-full min-h-[260px] select-none w-full text-base">
                  点击生成图像，找到你的创作伙伴
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* 历史记录大卡片 */}
        <div className={historyCard + " mt-1"}>
          <div className="flex justify-between items-center mb-6">
            <span className={historyLabel}>历史记录</span>
            <Button
              variant="ghost"
              className="text-red-400 hover:bg-red-400/10"
              onClick={() => setHistory([])}
            >
              <Trash className="mr-2" size={18} /> 清空历史
            </Button>
          </div>
          {history.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-500">
              暂无历史记录
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {history.map(item => (
                <div key={item.id}
                  className="bg-[#172231] rounded-xl shadow-md border-none p-3 flex flex-col justify-between group hover:scale-105 transition"
                >
                  <img
                    src={item.image}
                    alt="历史图像"
                    className="rounded-lg mb-3 border border-[#243553] object-cover h-28 w-full bg-[#101b26]"
                  />
                  <div className="flex flex-col flex-1 min-h-[45px] mb-1">
                    <div className="truncate text-xs text-gray-300/95">{item.prompt}</div>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs text-cyan-400 font-bold">{modelOptions.find(m => m.id === item.model)?.name || item.model}</span>
                    <Button
                      size="sm"
                      className="bg-cyan-700 hover:bg-cyan-800 text-white px-3 py-1 text-xs rounded"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = item.image;
                        link.download = 'ai-image-history.png';
                        link.click();
                      }}
                    >下载</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 页脚 */}
        <footer className="pt-16 text-center text-gray-600 text-xs opacity-60 select-none">
          © 2025 Azad实验室 | 基于Pollinations.AI | 体验终极AI创造
        </footer>
      </div>
    </div>
  );
};

export default Image;

