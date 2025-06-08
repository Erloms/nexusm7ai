
import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Download, Image as ImageIcon, Loader2, RefreshCw, Wand2, Shuffle, Upload, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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
  const [selectedModel, setSelectedModel] = useState('flux');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<Array<{id: number, url: string, prompt: string, timestamp: Date}>>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = [
    { id: 'flux', name: 'FLUX 通用创意', description: 'FLUX - 通用创意模型' },
    { id: 'flux-pro', name: 'FLUX Pro 专业版', description: 'FLUX Pro - 专业版本，最高质量' },
    { id: 'flux-realism', name: 'FLUX Realism 超真实', description: 'FLUX Realism - 写实风格专用' },
    { id: 'flux-anime', name: 'FLUX Anime 动漫风', description: 'FLUX Anime - 动漫风格专用' },
    { id: 'flux-3d', name: 'FLUX 3D 三维效果', description: 'FLUX 3D - 三维效果专用' },
    { id: 'turbo', name: 'Turbo 极速生成', description: 'Turbo - 极速生成模型' },
  ];

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 图片解析提示词功能
  const analyzeImagePrompt = async (file: File) => {
    setAnalyzing(true);
    try {
      // 模拟Gemini 2.0视觉模型分析
      // 在实际应用中，这里应该调用Gemini 2.0 Vision API
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        // 模拟AI分析结果
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 这里应该是实际的API调用
        // const analysisResult = await analyzeImageWithGemini(base64Image);
        
        // 模拟分析结果
        const mockAnalysis = "A beautiful digital art portrait of a young woman with flowing hair, vibrant colors, soft lighting, artistic style, highly detailed, masterpiece quality, trending on artstation";
        
        setPrompt(mockAnalysis);
        
        toast({
          title: "图片分析完成",
          description: "已为您生成优化的提示词",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('图片分析错误:', error);
      toast({
        title: "分析失败",
        description: "图片分析失败，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        analyzeImagePrompt(file);
      } else {
        toast({
          title: "文件类型错误",
          description: "请上传图片文件",
          variant: "destructive",
        });
      }
    }
  };

  const optimizePrompt = async (originalPrompt: string) => {
    try {
      setLoading(true);
      
      // 智能提示词优化 - 更详细的扩写逻辑，避免摄影风格
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

    // 检测风格意图 - 优先检查艺术风格关键词
    const isArtStyle = /艺术|绘画|插画|动漫|卡通|手绘|art|painting|illustration|drawing|anime|cartoon|sketch|digital art|concept art|artwork/i.test(originalPrompt);
    const isRealisticStyle = /真实|现实|照片|摄影|realistic|real|photo|photography|photorealistic/i.test(originalPrompt);
    const isFantasyStyle = /幻想|魔法|科幻|梦幻|fantasy|magic|sci-fi|surreal|dreamy|mystical/i.test(originalPrompt);
    const is3DStyle = /3d|三维|建模|渲染|blender|cinema4d|3d render|3d model/i.test(originalPrompt);

    // 检测人物相关
    if (/人|女|男|girl|boy|woman|man|person|people|character/i.test(originalPrompt)) {
      if (isArtStyle) {
        enhanced += ', beautiful character design, expressive eyes, detailed facial features, digital art style, professional illustration, sharp details, artistic composition';
      } else if (isFantasyStyle) {
        enhanced += ', fantasy character, magical appearance, ethereal beauty, enchanted features, mystical atmosphere, fantasy art style';
      } else if (!isRealisticStyle) {
        enhanced += ', detailed portrait, beautiful facial features, expressive eyes, professional digital art, high quality illustration, artistic style';
      } else {
        enhanced += ', highly detailed portrait, beautiful facial features, expressive eyes, perfect skin texture, professional portrait photography, studio lighting, sharp focus on face, realistic hair texture, natural expression, high resolution';
      }
    }

    // 根据检测到的风格添加对应的质量增强词
    if (isArtStyle) {
      enhanced += ', digital art masterpiece, highly detailed illustration, vibrant color palette, artistic composition, professional digital painting, creative artwork, trending on artstation, award winning art, fantasy art style';
    } else if (isFantasyStyle) {
      enhanced += ', fantasy art, magical atmosphere, enchanted scene, mystical lighting, otherworldly beauty, fantasy masterpiece, detailed fantasy illustration, surreal elements';
    } else if (is3DStyle) {
      enhanced += ', high quality 3d render, detailed 3d model, professional 3d visualization, clean topology, perfect lighting, 3d masterpiece, digital art';
    } else if (isRealisticStyle) {
      // 只有在明确要求真实风格时才添加摄影相关词汇
      enhanced += ', masterpiece, best quality, ultra detailed, 8k resolution, photorealistic, professional photography, sharp focus, perfect lighting, vivid colors, highly detailed, award winning photo';
    } else {
      // 默认添加艺术风格词汇，避免摄影风格
      enhanced += ', masterpiece, best quality, ultra detailed, high resolution, digital art, artistic style, vibrant colors, creative composition, highly detailed illustration, fantasy art';
    }

    return enhanced;
  };

  const generateRandomPrompt = () => {
    const randomPrompts = [
      "A hyper-detailed fantasy portrait of a mystical warrior, glowing magical aura, intricate armor design, digital art masterpiece, trending on artstation",
      "An ethereal landscape with floating islands, magical waterfalls, vibrant fantasy colors, digital painting, highly detailed artistic composition",
      "A steampunk cityscape with brass mechanisms, Victorian architecture, atmospheric lighting, concept art style, award winning illustration",
      "A beautiful anime-style character with flowing hair, expressive eyes, magical background, digital art, highly detailed anime illustration",
      "An abstract cosmic scene with swirling galaxies, nebula clouds, vibrant space colors, digital art masterpiece, surreal composition",
      "A fantasy forest with bioluminescent plants, magical creatures, enchanted atmosphere, digital painting, highly detailed fantasy art",
      "A cyberpunk street scene with neon lights, futuristic architecture, atmospheric rain, concept art style, digital illustration",
      "A majestic dragon in a mountainous landscape, epic fantasy art, dramatic lighting, highly detailed digital painting, mythical creature art"
    ];
    
    const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(randomPrompt);
    
    toast({
      title: "随机提示词已生成",
      description: "已为您生成一个随机艺术风格提示词",
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
      const timestamp = Date.now();
      const randomSeed = seed || Math.floor(Math.random() * 1000000);
      
      // 增强提示词，默认添加艺术风格
      const enhancedPrompt = `${prompt}, digital art, artistic style, high quality, detailed illustration, vibrant colors, creative composition`;
      
      const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${randomSeed}&model=${selectedModel}&nologo=true`;
      
      console.log('生成图像API URL:', apiUrl);
      console.log('增强后提示词:', enhancedPrompt);
      console.log('选择的模型:', selectedModel);
      
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
                          onClick={() => fileInputRef.current?.click()}
                          disabled={analyzing}
                          className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {analyzing ? '分析中...' : '解析图片'}
                        </Button>
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
                      placeholder="描述您想要生成的图像，例如：a beautiful fantasy landscape with mountains and lakes, digital art style"
                      className="min-h-[100px] bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
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
                  {loading || analyzing ? (
                    <div className="flex flex-col items-center justify-center p-8">
                      <Loader2 className="h-12 w-12 text-nexus-blue animate-spin mb-4" />
                      <p className="text-white/80 text-center">
                        {analyzing ? '正在分析图片，请稍候...' : '正在生成您的图像，请稍候...'}
                      </p>
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
