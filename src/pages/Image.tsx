
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Loader2, Download, RefreshCw, Sparkles, Wand2, Image as ImageIcon, History, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Image = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('pixelated, poor lighting, overexposed, underexposed, chinese text, asian text, chinese characters, cropped, duplicated, ugly, extra fingers, bad hands, missing fingers, mutated hands');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [seed, setSeed] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux-pro');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [customWidth, setCustomWidth] = useState('1024');
  const [customHeight, setCustomHeight] = useState('1024');
  const [history, setHistory] = useState<Array<{id: string, prompt: string, image: string, timestamp: number}>>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Master prompts for different styles
  const masterPrompts = [
    { name: "写实人像", prompt: "photorealistic portrait, highly detailed, professional lighting, sharp focus, 8k resolution" },
    { name: "动漫风格", prompt: "anime style, detailed illustration, vibrant colors, manga aesthetic, cel shading" },
    { name: "奇幻艺术", prompt: "fantasy art, magical atmosphere, ethereal lighting, mystical elements, artstation quality" },
    { name: "科幻风格", prompt: "sci-fi concept art, futuristic, cyberpunk aesthetic, neon lighting, high tech" },
    { name: "油画风格", prompt: "oil painting style, classical art, rich textures, painterly brushstrokes, artistic masterpiece" },
    { name: "水彩画", prompt: "watercolor painting, soft brush strokes, flowing colors, artistic, traditional media" },
    { name: "素描风格", prompt: "pencil sketch, hand-drawn, artistic linework, monochrome, detailed shading" },
    { name: "卡通风格", prompt: "cartoon style, cute and colorful, simplified features, playful design" }
  ];

  // Generate random seed function
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
    return randomSeed.toString();
  };

  // Initialize with random seed on component mount
  useEffect(() => {
    generateRandomSeed();
    // Load history from localStorage
    const savedHistory = localStorage.getItem('ai_image_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const checkUsageLimit = () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录账户才能使用AI图像生成功能",
        variant: "destructive"
      });
      return false;
    }

    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    
    if (usage.remaining <= 0) {
      toast({
        title: "使用次数已用完",
        description: "免费用户每日限制10次图像生成，请升级会员获得无限次数",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const updateUsage = () => {
    if (!user) return;
    
    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    usage.remaining = Math.max(0, usage.remaining - 1);
    localStorage.setItem(`nexusAi_image_usage_${user.id}`, JSON.stringify(usage));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入提示词",
        description: "请描述您想要生成的图像内容",
        variant: "destructive"
      });
      return;
    }

    if (!checkUsageLimit()) return;

    setIsLoading(true);
    
    try {
      // If seed is empty, generate a random one for this generation
      const currentSeed = seed || generateRandomSeed();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock response - in real implementation, this would be the actual generated image
      const mockImages = [
        "/lovable-uploads/422c49d8-b952-4d1b-a8a8-42a64c3fe9cf.png",
        "/lovable-uploads/49b1d8d8-c189-444b-b2de-80c73d893b6a.png",
        "/lovable-uploads/49ddf65d-4ef4-46a1-94b7-2936d866be27.png"
      ];
      
      const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
      
      setGeneratedImage(randomImage);
      updateUsage();

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        image: randomImage,
        timestamp: Date.now()
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)]; // Keep only last 10
      setHistory(updatedHistory);
      localStorage.setItem('ai_image_history', JSON.stringify(updatedHistory));
      
      toast({
        title: "图像生成成功",
        description: `使用种子值: ${currentSeed}`,
      });
      
    } catch (error) {
      console.error('生成图像失败:', error);
      toast({
        title: "生成失败",
        description: "图像生成过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nexus-ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const applyMasterPrompt = (masterPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${masterPrompt}` : masterPrompt);
  };

  const optimizePrompt = () => {
    if (!prompt.trim()) {
      toast({
        title: "请先输入提示词",
        description: "需要有基础提示词才能进行优化",
        variant: "destructive"
      });
      return;
    }
    
    // Add optimization keywords
    const optimizedAdditions = "masterpiece, best quality, highly detailed, professional, 8k resolution, perfect composition, trending on artstation";
    setPrompt(prev => `${prev}, ${optimizedAdditions}`);
    
    toast({
      title: "提示词已优化",
      description: "已添加质量优化关键词",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_image_history');
    toast({
      title: "历史记录已清空",
      description: "所有生成历史已删除",
    });
  };

  const getRemainingUsage = () => {
    if (!user) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    return usage.remaining;
  };

  const getCurrentDimensions = () => {
    if (aspectRatio === 'custom') {
      return `${customWidth} × ${customHeight}`;
    }
    
    const ratios: { [key: string]: string } = {
      '1:1': '1024 × 1024',
      '16:9': '1024 × 576',
      '9:16': '576 × 1024',
      '4:3': '1024 × 768',
      '3:4': '768 × 1024',
      '21:9': '1024 × 439',
    };
    
    return ratios[aspectRatio] || '1024 × 1024';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
              AI 绘画生成器
            </h1>
            <p className="text-gray-400 text-lg">
              智能AI驱动的视觉增强创作平台
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                剩余生成次数: {getRemainingUsage()}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Section */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-cyan-400" />
                    提示词 (Prompt)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Master Prompts */}
                  <div>
                    <label className="block text-white font-medium mb-2">大师提示词</label>
                    <div className="flex gap-2 mb-3">
                      <Button
                        onClick={optimizePrompt}
                        variant="outline"
                        size="sm"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        智能优化
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {masterPrompts.map((item, index) => (
                        <Button
                          key={index}
                          onClick={() => applyMasterPrompt(item.prompt)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#203042]/60 text-gray-300 hover:bg-[#203042]/80 hover:text-white"
                        >
                          {item.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要生成的图像..."
                    className="bg-[#0f1419] border-[#203042]/60 text-white min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">
                    {prompt.length}/2000 字符
                  </p>
                </CardContent>
              </Card>

              {/* Negative Prompt */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">负面提示词 (Negative Prompt)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="描述不想要的元素..."
                    className="bg-[#0f1419] border-[#203042]/60 text-white min-h-[80px] resize-none text-sm"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {negativePrompt.length}/1000 字符
                  </p>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">模型选择</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-[#0f1419] border-[#203042]/60 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2740] border-[#203042]/60">
                      <SelectItem value="flux-pro" className="text-white">Flux Pro (专业版)</SelectItem>
                      <SelectItem value="flux-dev" className="text-white">Flux Dev (开发版)</SelectItem>
                      <SelectItem value="stable-diffusion" className="text-white">Stable Diffusion</SelectItem>
                      <SelectItem value="midjourney" className="text-white">Midjourney Style</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Dimensions */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">尺寸设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm mb-2">宽度</label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="bg-[#0f1419] border-[#203042]/60 text-white"
                        min="256"
                        max="2048"
                        step="64"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm mb-2">高度</label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="bg-[#0f1419] border-[#203042]/60 text-white"
                        min="256"
                        max="2048"
                        step="64"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm mb-2">长宽比预设</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'].map((ratio) => (
                        <Button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          variant={aspectRatio === ratio ? "default" : "outline"}
                          size="sm"
                          className={aspectRatio === ratio 
                            ? "bg-cyan-500 text-white" 
                            : "border-[#203042]/60 text-gray-300 hover:bg-[#203042]/80"
                          }
                        >
                          {ratio}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      当前尺寸: {getCurrentDimensions()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Seed */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">种子值 (Seed)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="留空则随机生成"
                      className="bg-[#0f1419] border-[#203042]/60 text-white flex-1"
                    />
                    <Button
                      onClick={generateRandomSeed}
                      variant="outline"
                      size="icon"
                      className="border-[#203042]/60 text-gray-400 hover:text-white hover:bg-[#203042]/80 shrink-0"
                      title="生成随机种子"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    相同提示词和种子值会生成相似图像
                  </p>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !user}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    生成图像
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel - Results & History */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="result" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#1a2740] border-[#203042]/60">
                  <TabsTrigger value="result" className="text-white data-[state=active]:bg-cyan-500">
                    生成结果
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-white data-[state=active]:bg-cyan-500">
                    <History className="h-4 w-4 mr-1" />
                    历史记录
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="result" className="mt-4">
                  <Card className="bg-[#1a2740] border-[#203042]/60">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-[#0f1419] border-[#203042]/60 border rounded-lg flex items-center justify-center min-h-[500px]">
                        {isLoading ? (
                          <div className="text-center">
                            <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin mb-4" />
                            <p className="text-gray-400">正在生成您的专属图像...</p>
                          </div>
                        ) : generatedImage ? (
                          <div className="text-center w-full">
                            <img
                              src={generatedImage}
                              alt="Generated"
                              className="max-w-full max-h-[500px] rounded-lg shadow-lg mx-auto mb-4 object-contain"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button 
                                onClick={handleDownload}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                下载
                              </Button>
                              <Button 
                                variant="outline"
                                className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white"
                              >
                                转视频
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="w-24 h-24 mx-auto mb-4 bg-[#203042]/30 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-12 h-12" />
                            </div>
                            <p>生成的图像将在这里显示</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <Card className="bg-[#1a2740] border-[#203042]/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white">生成历史</CardTitle>
                      {history.length > 0 && (
                        <Button
                          onClick={clearHistory}
                          variant="outline"
                          size="sm"
                          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          清空
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {history.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>暂无生成历史</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {history.map((item) => (
                            <div key={item.id} className="bg-[#0f1419] rounded-lg p-3 border border-[#203042]/60">
                              <img
                                src={item.image}
                                alt="History"
                                className="w-full aspect-square object-cover rounded mb-2"
                              />
                              <p className="text-xs text-gray-400 truncate" title={item.prompt}>
                                {item.prompt}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Image;
