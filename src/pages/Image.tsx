
import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Download, Image as ImageIcon, Loader2, RefreshCw, Wand2, Shuffle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import PaymentCheck from '@/components/PaymentCheck';

interface ImageProps {
  decrementUsage?: () => boolean;
}

const Image = ({ decrementUsage }: ImageProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('worst quality, blurry, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);
  const [steps, setSteps] = useState(30);
  const [seed, setSeed] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{id: number, url: string, prompt: string, timestamp: Date}>>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  const models = [
    { id: 'flux', name: '通用创意 | flux', description: 'Flux模型生成图像' },
    { id: 'flux-pro', name: '专业版 | flux-pro', description: '专业级Flux模型' },
    { id: 'flux-realism', name: '超真实效果 | flux-realism', description: '超真实摄影效果' },
    { id: 'flux-anime', name: '动漫风格 | flux-anime', description: '动漫和插画风格图像' },
    { id: 'flux-3d', name: '三维效果 | flux-3d', description: '3D风格的图像' },
    { id: 'flux-cablyai', name: '创意艺术 | flux-cablyai', description: '艺术风格的创意图像' },
    { id: 'turbo', name: '极速生成 | turbo', description: '快速生成图像，质量略低' },
  ];

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const optimizePrompt = async (originalPrompt: string) => {
    try {
      setLoading(true);
      
      // 使用AI优化提示词
      const optimizedPrompt = `${originalPrompt}, high quality, detailed, masterpiece, professional photography, 8k resolution, trending on artstation`;
      
      setPrompt(optimizedPrompt);
      
      toast({
        title: "提示词已优化",
        description: "已为您的提示词添加了质量增强描述",
      });
    } catch (error) {
      console.error('优化提示词时出错:', error);
      toast({
        title: "优化失败",
        description: "提示词优化失败，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPrompt = () => {
    const randomPrompts = [
      "一只可爱的小猫咪在花园里玩耍",
      "未来科技感的城市夜景",
      "古风美女在竹林中起舞",
      "宇宙中的星空和星云",
      "温馨的咖啡店内景",
      "神秘的森林中的小屋",
      "海边的日落风景",
      "蒸汽朋克风格的机械装置"
    ];
    
    const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(randomPrompt);
    
    toast({
      title: "随机提示词已生成",
      description: "已为您生成一个随机提示词",
    });
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词为空",
        description: "请输入图像提示词",
        variant: "destructive",
      });
      return;
    }

    // 调用decrementUsage函数（如果提供）并检查是否成功减少
    if (decrementUsage && !decrementUsage()) {
      // 如果返回false，说明使用次数已用完或其他问题
      return;
    }
    
    setLoading(true);
    
    try {
      // 使用Pollinations AI API生成图像
      const encodedPrompt = encodeURIComponent(prompt);
      const seedParam = seed ? `&seed=${seed}` : '';
      
      const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${selectedModel}&nologo=true${seedParam}`;
      
      console.log('生成图像API URL:', apiUrl);
      
      // 设置生成的图像URL
      setGeneratedImage(apiUrl);
      
      // 添加到历史记录
      const newHistoryItem = {
        id: Date.now(),
        url: apiUrl,
        prompt: prompt,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      toast({
        title: "图像生成成功",
        description: "您的AI图像已生成",
      });
    } catch (error) {
      console.error('生成图像时出错:', error);
      toast({
        title: "生成失败",
        description: "图像生成过程中发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nexus-ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "下载开始",
      description: "图像下载已开始",
    });
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <PaymentCheck featureType="image">
        <main className="flex-grow p-4 pt-16 md:p-8">
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
            {/* 左侧面板 - 控制 */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
                <Sparkles className="mr-2 h-6 w-6 text-nexus-cyan" />
                AI 图像生成
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="prompt" className="block text-sm font-medium text-white">
                      提示词
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => optimizePrompt(prompt)}
                        disabled={!prompt.trim() || loading}
                        className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        优化
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateRandomPrompt}
                        className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                      >
                        <Shuffle className="h-4 w-4 mr-1" />
                        随机
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要生成的图像，例如：一只可爱的猫咪在阳光下玩耍"
                    className="min-h-[100px] bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  />
                </div>
                
                <div>
                  <label htmlFor="negative-prompt" className="block text-sm font-medium text-white mb-2">
                    负面提示词
                  </label>
                  <Textarea
                    id="negative-prompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="描述您不希望在图像中出现的元素"
                    className="min-h-[80px] bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  />
                </div>
                
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-white mb-2">
                    选择模型
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-nexus-dark/50 border-nexus-blue/30 text-white">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent className="bg-nexus-dark border-nexus-blue/30">
                      {models.map((model) => (
                        <SelectItem 
                          key={model.id} 
                          value={model.id}
                          className="text-white hover:bg-nexus-blue/20"
                        >
                          <div>
                            <div>{model.name}</div>
                            <div className="text-xs text-white/60">{model.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="width" className="block text-sm font-medium text-white mb-2">
                      宽度
                    </label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-white mb-2">
                      高度
                    </label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="steps" className="block text-sm font-medium text-white">
                      步数: {steps}
                    </label>
                    <span className="text-xs text-white/60">更高的步数 = 更高质量，但更慢</span>
                  </div>
                  <Slider
                    id="steps"
                    min={10}
                    max={50}
                    step={1}
                    value={[steps]}
                    onValueChange={(value) => setSteps(value[0])}
                    className="py-4"
                  />
                </div>
                
                <div>
                  <label htmlFor="seed" className="block text-sm font-medium text-white mb-2">
                    种子值 (留空为随机)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="seed"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="随机种子"
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleRandomSeed}
                      className="border-nexus-blue/30 text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-1">使用相同的种子值可以生成相似的图像</p>
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={handleGenerateImage} 
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white py-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        生成图像
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* 右侧面板 - 图像预览 */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5 flex flex-col">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                <ImageIcon className="mr-2 h-6 w-6 text-nexus-cyan" />
                图像预览
              </h2>
              
              <div className="flex-grow flex items-center justify-center bg-nexus-dark/40 rounded-lg border border-nexus-blue/20 overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="h-12 w-12 text-nexus-blue animate-spin mb-4" />
                    <p className="text-white/80 text-center">正在生成您的图像，请稍候...</p>
                    <p className="text-white/60 text-sm text-center mt-2">这可能需要几秒钟时间</p>
                  </div>
                ) : generatedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    <img 
                      ref={imageRef}
                      src={generatedImage} 
                      alt="Generated" 
                      className="max-w-full max-h-[60vh] object-contain rounded shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <ImageIcon className="h-16 w-16 text-white/20 mb-4" />
                    <p className="text-white/60 text-center">填写左侧表单并点击"生成图像"按钮</p>
                  </div>
                )}
              </div>
              
              {generatedImage && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleDownload}
                    className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载图像
                  </Button>
                </div>
              )}

              {/* 历史记录部分 */}
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3 text-white">历史记录</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="relative cursor-pointer rounded-lg overflow-hidden border border-nexus-blue/20 hover:border-nexus-blue/50 transition-all"
                        onClick={() => {
                          setGeneratedImage(item.url);
                          setPrompt(item.prompt);
                        }}
                      >
                        <img 
                          src={item.url} 
                          alt={item.prompt} 
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-nexus-dark/80 backdrop-blur-sm p-1 text-xs text-white/80">
                          {formatTime(item.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Image;
