
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, Settings, Sparkles, CheckCircle2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Image = () => {
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('worst quality, blurry');
  const [model, setModel] = useState('flux-schnell');
  const [width, setWidth] = useState('720');
  const [height, setHeight] = useState('1280');
  const [seed, setSeed] = useState('-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [enableSafetyFilter, setEnableSafetyFilter] = useState(true);
  const [enableWatermark, setEnableWatermark] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词不能为空",
        description: "请输入图像生成提示词",
        variant: "destructive",
      });
      return;
    }

    // Check usage limits for free users
    if (!checkPaymentStatus()) {
      const usageKey = `nexusAi_image_usage_${user?.id}`;
      const usage = JSON.parse(localStorage.getItem(usageKey) || '{"remaining": 10}');
      
      if (usage.remaining <= 0) {
        toast({
          title: "使用次数已用完",
          description: "免费用户每日限制10次，请升级VIP享受无限使用",
          variant: "destructive",
        });
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated images
      const newImages = [
        `https://picsum.photos/${width}/${height}?random=${Date.now()}`,
        `https://picsum.photos/${width}/${height}?random=${Date.now() + 1}`,
        `https://picsum.photos/${width}/${height}?random=${Date.now() + 2}`,
        `https://picsum.photos/${width}/${height}?random=${Date.now() + 3}`,
      ];
      
      setGeneratedImages(newImages);
      
      // Update usage for free users
      if (!checkPaymentStatus()) {
        const usageKey = `nexusAi_image_usage_${user?.id}`;
        const usage = JSON.parse(localStorage.getItem(usageKey) || '{"remaining": 10}');
        usage.remaining = Math.max(0, usage.remaining - 1);
        localStorage.setItem(usageKey, JSON.stringify(usage));
      }
      
      toast({
        title: "图像生成成功",
        description: "您的AI图像已生成完成",
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "图像生成遇到问题，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Navigation />
      
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI绘画生成器
            </h1>
            <p className="text-gray-400 mb-6">基于Pollinations AI的高质量图像生成系统</p>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6">
              免费体验
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧控制面板 */}
            <div className="space-y-6">
              {/* 提示词区域 */}
              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-cyan-400 font-medium mb-3 flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                      提示词 (Prompt)
                    </h3>
                    <Textarea
                      placeholder="描述您想要生成的图像的内容"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      简介：用于描述想要生成图像的正面内容，可以是对象、场景、颜色、氛围等。
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-cyan-400 font-medium mb-3 flex items-center">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></div>
                      负面提示词 (Negative Prompt)
                    </h3>
                    <Textarea
                      placeholder="worst quality, blurry"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[80px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      简介：用于描述不希望在图像中出现的内容，如模糊、低质量等。
                    </p>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-cyan-400 font-medium mb-3">模型选择</h3>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="flux-schnell">Flux (默认模型)</SelectItem>
                        <SelectItem value="flux-dev">FLUX Dev</SelectItem>
                        <SelectItem value="flux-pro">FLUX Pro</SelectItem>
                        <SelectItem value="flux-realism">FLUX Realism</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-gray-400 text-sm mt-2">
                      Flux 新图像模型，性能出色且适合发布
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-cyan-400 font-medium mb-3">宽度</h3>
                      <Select value={width} onValueChange={setWidth}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="720">720</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h3 className="text-cyan-400 font-medium mb-3">高度</h3>
                      <Select value={height} onValueChange={setHeight}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="720">720</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                          <SelectItem value="1280">1280</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    简介：设置图像的像素宽度和高度，建议不超过1024以获得最佳效果。
                  </p>

                  <div className="mb-4">
                    <h3 className="text-cyan-400 font-medium mb-3">种子数 (Seed)</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        className="flex-1 bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white"
                        placeholder="-1"
                      />
                      <Button
                        onClick={() => setSeed('-1')}
                        className="bg-cyan-500 hover:bg-cyan-600"
                      >
                        随机
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      简介：用于保证图像生成的可重复性，输入相同的种子可以生成相似的图像。-1表示随机种子。
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="safety-filter"
                        checked={enableSafetyFilter}
                        onCheckedChange={setEnableSafetyFilter}
                      />
                      <Label htmlFor="safety-filter" className="text-white">启用安全</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="watermark"
                        checked={enableWatermark}
                        onCheckedChange={setEnableWatermark}
                      />
                      <Label htmlFor="watermark" className="text-white">安全蒙版(仅艺术内容用途)</Label>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-3 text-lg font-medium"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <Sparkles className="animate-spin h-5 w-5 mr-2" />
                        生成绘画
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        生成绘画
                      </div>
                    )}
                  </Button>

                  <div className="flex justify-center mt-4">
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      清空
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧图片预览区域 */}
            <div>
              <Card className="bg-gray-800/50 border-cyan-500/20">
                <CardContent className="p-6">
                  <h3 className="text-cyan-400 font-medium mb-4">图片预览</h3>
                  
                  {generatedImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {generatedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Generated ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button
                              size="sm"
                              className="bg-cyan-500 hover:bg-cyan-600"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = image;
                                link.download = `ai-image-${index + 1}.jpg`;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
                      <p className="text-gray-400">
                        {isGenerating ? '正在生成图像，请稍后等待...' : '点击生成绘画按钮开始创作'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 历史记录区域 */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">历史记录</h3>
              <h3 className="text-xl font-bold text-white">清空历史</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* 历史记录项目 */}
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                  <div className="h-24 bg-gray-700 rounded mb-2"></div>
                  <p className="text-xs text-gray-400 truncate">历史绘画作品{i + 1}</p>
                  <p className="text-xs text-cyan-400">FLUX PRO</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Image;
