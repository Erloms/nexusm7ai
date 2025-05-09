
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, Copy, RefreshCw, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

interface HistoryItem {
  id: string;
  prompt: string;
  negativePrompt: string;
  model: string;
  width: number;
  height: number;
  seed: number;
  imageUrl: string;
  timestamp: number;
}

const modelOptions = [
  { value: 'flux', label: '通用创意 | flux' },
  { value: 'flux-pro', label: '专业版 | flux-pro' },
  { value: 'flux-realism', label: '超真实效果 | flux-realism' },
  { value: 'flux-anime', label: '动漫风格 | flux-anime' },
  { value: 'flux-3d', label: '三维效果 | flux-3d' },
  { value: 'flux-cablyai', label: '创意艺术 | flux-cablyai' },
  { value: 'turbo', label: '极速生成 | turbo' }
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [width, setWidth] = useState(720);
  const [height, setHeight] = useState(1280);
  const [seed, setSeed] = useState(-1);
  const [safeMode, setSafeMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('nexusAiImageHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved history:", e);
      }
    }
  }, []);

  // Generate random seed
  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  // Handle form submission to generate image
  const handleGenerateImage = () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词不能为空",
        description: "请输入图像生成提示词",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Encode prompts for URL
    const encodedPrompt = encodeURIComponent(prompt);
    const encodedNegativePrompt = encodeURIComponent(negativePrompt);
    
    // Always remove logo and respect safe mode setting
    const noLogo = true;
    const safe = safeMode;
    
    // Construct the image URL with all parameters
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}`;
    
    if (seed !== -1) {
      url += `&seed=${seed}`;
    }
    
    if (negativePrompt) {
      url += `&negative_prompt=${encodedNegativePrompt}`;
    }
    
    if (noLogo) {
      url += "&nologo=true";
    }
    
    if (!safe) {
      url += "&safe=false";
    }
    
    // Set the image URL
    setImageUrl(url);
    
    // Save to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      prompt,
      negativePrompt,
      model,
      width,
      height,
      seed,
      imageUrl: url,
      timestamp: Date.now()
    };
    
    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('nexusAiImageHistory', JSON.stringify(updatedHistory));
    
    setLoading(false);
  };

  // Clear current form input
  const handleClearInput = () => {
    setPrompt('');
    setNegativePrompt('');
    setModel('flux');
    setWidth(720);
    setHeight(1280);
    setSeed(-1);
    setSafeMode(true);
  };

  // Copy image URL to clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "提示词已复制",
      description: "提示词已成功复制到剪贴板",
    });
  };

  // Load a history item to the form
  const handleLoadHistory = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setNegativePrompt(item.negativePrompt);
    setModel(item.model);
    setWidth(item.width);
    setHeight(item.height);
    setSeed(item.seed);
    setImageUrl(item.imageUrl);
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nexusAiImageHistory');
    toast({
      title: "历史记录已清空",
    });
  };

  // Download image
  const handleDownloadImage = () => {
    // Open image in new tab, as direct download might not work with external URLs
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-nexus-dark">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-20 pb-16">
        <h1 className="text-3xl font-bold text-center my-8">
          <span className="text-gradient">AI图像生成</span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-nexus-blue" />
                图像参数设置
              </h2>
              
              {/* Prompt */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-white mb-2">
                    提示词 (Prompt)
                  </label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想要生成的图像，例如：一只蓝色的猫咪在森林中奔跑，梦幻风格..."
                    className="h-32 bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  />
                </div>
                
                {/* Negative Prompt */}
                <div>
                  <label htmlFor="negativePrompt" className="block text-sm font-medium text-white mb-2">
                    负面提示词 (Negative Prompt)
                  </label>
                  <Input
                    id="negativePrompt"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="指定不希望在图像中出现的元素，例如：模糊, 扭曲, 低质量"
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  />
                </div>
                
                {/* Model */}
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-white mb-2">
                    模型选择
                  </label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="bg-nexus-dark/50 border-nexus-blue/30 text-white">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent className="bg-nexus-dark border-nexus-blue/30">
                      {modelOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-white hover:bg-nexus-blue/20"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Image Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="width" className="block text-sm font-medium text-white mb-2">
                      宽度 (Width)
                    </label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white focus:border-nexus-blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-white mb-2">
                      高度 (Height)
                    </label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white focus:border-nexus-blue"
                    />
                  </div>
                </div>
                
                {/* Seed */}
                <div className="flex gap-3 items-end">
                  <div className="flex-grow">
                    <label htmlFor="seed" className="block text-sm font-medium text-white mb-2">
                      种子值 (Seed)
                    </label>
                    <Input
                      id="seed"
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Number(e.target.value))}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white focus:border-nexus-blue"
                    />
                    <p className="text-xs text-white/60 mt-1">-1 表示随机种子</p>
                  </div>
                  <Button 
                    onClick={generateRandomSeed}
                    variant="outline"
                    className="bg-transparent border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-blue"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Safe Mode */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="safeMode" 
                    checked={safeMode} 
                    onCheckedChange={(checked) => setSafeMode(!!checked)} 
                    className="data-[state=checked]:bg-nexus-blue"
                  />
                  <label
                    htmlFor="safeMode"
                    className="text-sm font-medium text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    安全模式 (过滤不适内容)
                  </label>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    className="flex-1 bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                    onClick={handleGenerateImage}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : "生成图像"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-blue"
                    onClick={handleClearInput}
                  >
                    清空
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column: Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
              <h2 className="text-xl font-bold text-white mb-4">图像预览</h2>
              
              <div className="w-full rounded-lg overflow-hidden bg-nexus-dark/50 border border-nexus-blue/20 flex items-center justify-center">
                {imageUrl ? (
                  <div className="relative w-full">
                    <img 
                      src={imageUrl} 
                      alt="Generated AI image" 
                      className="w-full h-auto object-contain"
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setLoading(false);
                        toast({
                          title: "图像加载失败",
                          description: "请检查参数后重试",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-white/60 p-4">
                    <ImageIcon className="w-16 h-16 mb-4 text-nexus-blue/40" />
                    <p className="text-center">点击"生成图像"开始创作</p>
                  </div>
                )}
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-10 w-10 animate-spin text-nexus-blue" />
                      <p className="mt-2 text-white">生成中，请稍候...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {imageUrl && (
                <div className="mt-4 flex space-x-3">
                  <Button
                    variant="outline"
                    className="bg-transparent border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-blue"
                    onClick={handleDownloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载图像
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-blue"
                    onClick={handleCopyPrompt}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制提示词
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* History Panel */}
        {history.length > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">历史记录</h2>
              <Button
                variant="outline"
                className="bg-transparent border border-red-500/50 hover:bg-red-500/20 text-red-400"
                onClick={handleClearHistory}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清空历史
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-nexus-dark/80 border border-nexus-blue/20 rounded-lg overflow-hidden cursor-pointer hover:border-nexus-blue/60 transition-colors"
                  onClick={() => handleLoadHistory(item)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.prompt} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-white text-sm truncate">{item.prompt}</p>
                    <p className="text-white/60 text-xs">{item.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ImageGenerator;
