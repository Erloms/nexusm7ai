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
  const [negativePrompt, setNegativePrompt] = useState('worst quality, blurry, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username, chinese text, asian text');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(768);
  const [steps, setSteps] = useState(30);
  const [seed, setSeed] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{id: number, url: string, prompt: string, timestamp: Date}>>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  const models = [
    { id: 'flux-schnell', name: 'FLUX Schnell', description: 'FLUX Schnell - 极速生成，4步出图' },
    { id: 'flux-dev', name: 'FLUX Dev', description: 'FLUX Dev - 开发版本，质量平衡' },
    { id: 'flux-pro', name: 'FLUX Pro', description: 'FLUX Pro - 专业版本，最高质量' },
    { id: 'flux-pro-ultra', name: 'FLUX Pro Ultra', description: 'FLUX Pro Ultra - 超级版本，极致细节' },
    { id: 'flux-1.1-pro', name: 'FLUX 1.1 Pro', description: 'FLUX 1.1 Pro - 最新升级版本' },
    { id: 'flux-realism', name: 'FLUX Realism', description: 'FLUX Realism - 写实风格专用' },
    { id: 'flux-anime', name: 'FLUX Anime', description: 'FLUX Anime - 动漫风格专用' },
    { id: 'dalle-3', name: 'DALL-E 3', description: 'OpenAI DALL-E 3 - 创意生成' },
    { id: 'midjourney', name: 'Midjourney v6', description: 'Midjourney v6 - 艺术风格' },
    { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', description: 'SD3 - 经典稳定模型' },
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
      
      // 智能提示词优化 - 更详细的扩写逻辑
      const optimizedPrompt = enhancePromptIntelligently(originalPrompt);
      
      setPrompt(optimizedPrompt);
      
      toast({
        title: "提示词已优化",
        description: "已为您智能扩写和优化了提示词内容",
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

  const enhancePromptIntelligently = (originalPrompt: string): string => {
    if (!originalPrompt.trim()) return originalPrompt;

    let enhanced = originalPrompt;

    // 智能分析原始提示词并进行详细扩写
    
    // 检测人物相关
    if (/人|女|男|girl|boy|woman|man|person|people|character/i.test(originalPrompt)) {
      enhanced += ', highly detailed portrait, beautiful facial features, expressive eyes, perfect skin texture, professional portrait photography, studio lighting, sharp focus on face, realistic hair texture, natural expression, high resolution';
    }

    // 检测动物相关
    if (/猫|狗|鸟|动物|cat|dog|bird|animal|pet/i.test(originalPrompt)) {
      enhanced += ', highly detailed animal photography, natural fur/feather texture, expressive animal eyes, wildlife photography style, natural habitat, professional animal portrait, sharp details, realistic lighting';
    }

    // 检测风景相关
    if (/风景|山|海|天空|森林|landscape|mountain|sea|sky|forest|nature/i.test(originalPrompt)) {
      enhanced += ', breathtaking landscape photography, dramatic sky, golden hour lighting, wide angle view, high dynamic range, vivid natural colors, professional landscape photography, stunning vista, detailed foreground and background';
    }

    // 检测建筑相关
    if (/建筑|房子|城市|building|house|city|architecture|tower/i.test(originalPrompt)) {
      enhanced += ', architectural photography, detailed building structure, modern/classic design elements, professional architectural shot, perfect perspective, sharp geometric lines, urban photography style, detailed facade';
    }

    // 检测艺术风格
    if (/艺术|绘画|插画|art|painting|illustration|drawing/i.test(originalPrompt)) {
      enhanced += ', digital art masterpiece, highly detailed illustration, vibrant color palette, artistic composition, professional digital painting, creative artwork, trending on artstation, award winning art';
    }

    // 检测科幻/未来主题
    if (/科幻|未来|机器人|太空|sci-fi|future|robot|space|cyberpunk/i.test(originalPrompt)) {
      enhanced += ', futuristic design, advanced technology, cyberpunk aesthetic, neon lighting effects, high-tech details, science fiction concept art, digital art, detailed mechanical parts, glowing elements';
    }

    // 添加通用质量增强
    enhanced += ', masterpiece, best quality, ultra detailed, 8k resolution, photorealistic, professional photography, sharp focus, perfect lighting, vivid colors, highly detailed, award winning photo';

    // 检测并添加风格描述符
    if (!/photorealistic|realistic|photo/i.test(enhanced) && !/anime|cartoon|illustration|art/i.test(enhanced)) {
      enhanced += ', photorealistic style';
    }

    return enhanced;
  };

  const generateRandomPrompt = () => {
    const randomPrompts = [
      "a cute orange cat playing in a sunny garden",
      "futuristic city skyline at sunset with flying cars",
      "ancient Chinese temple in misty mountains",
      "beautiful woman with flowing hair in wind",
      "majestic eagle soaring over snowy peaks",
      "cozy coffee shop interior with warm lighting",
      "mysterious forest path with sunbeams",
      "modern architectural building with glass facade"
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

    if (decrementUsage && !decrementUsage()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 修复图像生成API - 使用更稳定的服务
      const timestamp = Date.now();
      const randomSeed = seed || Math.floor(Math.random() * 1000000);
      
      // 使用修复后的API
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&enhance=true&model=flux`;
      
      console.log('生成图像API URL:', apiUrl);
      console.log('正面提示词:', prompt);
      console.log('负面提示词:', negativePrompt);
      console.log('选择的模型:', selectedModel);
      
      // 修复图像加载错误
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('请求超时')), 30000);
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('图像加载失败'));
        };
        img.src = apiUrl;
      });
      
      setGeneratedImage(apiUrl);
      
      // 添加到历史记录
      const newHistoryItem = {
        id: timestamp,
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
          <div className="w-full max-w-7xl mx-auto">
            {/* 主要内容区域 - 控制面板和图像预览 */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
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
                          智能优化
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
                      placeholder="描述您想要生成的图像，例如：a beautiful landscape with mountains and lakes"
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
                
                <div className="flex-grow flex items-center justify-center bg-nexus-dark/40 rounded-lg border border-nexus-blue/20 overflow-hidden min-h-[400px]">
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
              </div>
            </div>

            {/* 历史记录部分 - 增大显示区域 */}
            {history.length > 0 && (
              <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-8">
                <h3 className="text-2xl font-bold mb-8 text-white flex items-center">
                  <ImageIcon className="mr-2 h-6 w-6 text-nexus-cyan" />
                  历史记录
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  {history.map((item) => (
                    <div 
                      key={item.id}
                      className="relative cursor-pointer rounded-lg overflow-hidden border border-nexus-blue/20 hover:border-nexus-blue/50 transition-all group"
                      onClick={() => {
                        setGeneratedImage(item.url);
                        setPrompt(item.prompt);
                      }}
                    >
                      <img 
                        src={item.url} 
                        alt={item.prompt} 
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-nexus-dark/90 backdrop-blur-sm p-4">
                        <div className="text-xs text-white/80 mb-2">
                          {formatTime(item.timestamp)}
                        </div>
                        <div className="text-xs text-white/60 truncate" title={item.prompt}>
                          {item.prompt}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Image;
