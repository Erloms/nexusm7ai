import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Download, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import PaymentCheck from '@/components/PaymentCheck';

interface ImageProps {
  decrementUsage?: () => void;
}

const Image = ({ decrementUsage }: ImageProps) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('worst quality, blurry, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username,SFW.');
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
    { id: 'flux', name: '通用创意 | flux', description: '适合大多数创意场景' },
    { id: 'flux-pro', name: '专业版 | flux-pro', description: '更高质量的图像生成' },
    { id: 'flux-realism', name: '超真实效果 | flux-realism', description: '生成逼真的照片级图像' },
    { id: 'flux-anime', name: '动漫风格 | flux-anime', description: '生成动漫和插画风格图像' },
    { id: 'flux-3d', name: '三维效果 | flux-3d', description: '生成3D风格的图像' },
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

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词为空",
        description: "请输入图像提示词",
        variant: "destructive",
      });
      return;
    }

    // Call decrementUsage if provided (for non-paying users)
    decrementUsage?.();
    
    setLoading(true);
    
    try {
      // Construct the URL with parameters
      const baseUrl = 'https://image.pollinations.ai/prompt/';
      const encodedPrompt = encodeURIComponent(prompt);
      const encodedNegativePrompt = encodeURIComponent(negativePrompt);
      
      // Add parameters
      const params = new URLSearchParams({
        width: width.toString(),
        height: height.toString(),
        seed: seed || Math.floor(Math.random() * 1000000).toString(),
        steps: steps.toString(),
        negative: encodedNegativePrompt,
        model: selectedModel,
        nologo: 'true'
      });
      
      const imageUrl = `${baseUrl}${encodedPrompt}?${params.toString()}`;
      
      // In a real app, you might want to fetch the image first to ensure it loads
      // For now, we'll just set the URL
      setGeneratedImage(imageUrl);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      toast({
        title: "图像生成成功",
        description: "您的AI图像已生成",
      });
    } catch (error) {
      console.error('Error generating image:', error);
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
        <main className="flex-grow flex flex-col md:flex-row gap-6 p-4 pt-20 md:p-20">
          {/* Left Panel - Controls */}
          <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-4">
            {/* Left Panel - Controls */}
            <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                <Sparkles className="mr-2 h-6 w-6 text-nexus-cyan" />
                AI 图像生成
              </h2>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-nexus-dark/50">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-nexus-blue text-white">基本设置</TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-nexus-blue text-white">高级设置</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="pt-4">
                  <div className="space-y-4">
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
                    
                    <div>
                      <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">
                        提示词
                      </label>
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
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="pt-4">
                  <div className="space-y-4">
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
                  </div>
                </TabsContent>
              </Tabs>
              
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
            
            {/* History Section */}
            {history.length > 0 && (
              <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5">
                <h3 className="text-xl font-bold mb-4 text-white">历史记录</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
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
                        className="w-full h-24 object-cover"
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
          
          {/* Right Panel - Image Preview */}
          <div className="w-full md:w-1/2 lg:w-3/5 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5 flex flex-col">
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
                    className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
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
        </main>
      </PaymentCheck>
      
      <Footer />
    </div>
  );
};

export default Image;
