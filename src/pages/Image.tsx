
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Loader2, Download, RefreshCw } from 'lucide-react';

const Image = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [seed, setSeed] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate random seed function
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
    return randomSeed.toString();
  };

  // Initialize with random seed on component mount
  useEffect(() => {
    generateRandomSeed();
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

  const getRemainingUsage = () => {
    if (!user) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    return usage.remaining;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
              AI 图像生成
            </h1>
            <p className="text-gray-400 text-lg">
              将您的想象转化为精美的艺术作品
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                剩余生成次数: {getRemainingUsage()}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧输入区域 */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  提示词描述
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述您想要生成的图像，例如：一只可爱的白色小猫坐在彩虹色的花园里，卡通风格，高清画质"
                  className="bg-[#1a2740] border-[#203042]/60 text-white min-h-[120px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {prompt.length}/500 字符
                </p>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  种子值 (Seed)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="留空则随机生成"
                    className="bg-[#1a2740] border-[#203042]/60 text-white flex-1"
                  />
                  <Button
                    onClick={generateRandomSeed}
                    variant="outline"
                    size="icon"
                    className="border-[#203042]/60 text-gray-400 hover:text-white hover:bg-[#203042]/80"
                    title="生成随机种子"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  相同提示词和种子值会生成相似图像
                </p>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !user}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  '生成图像'
                )}
              </Button>
            </div>

            {/* 右侧预览区域 */}
            <div className="space-y-4">
              <label className="block text-white font-medium">
                生成结果
              </label>
              
              <div className="bg-[#1a2740] border-[#203042]/60 border rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 text-pink-400 animate-spin mb-4" />
                    <p className="text-gray-400">正在生成您的专属图像...</p>
                  </div>
                ) : generatedImage ? (
                  <div className="text-center">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="max-w-full max-h-80 rounded-lg shadow-lg mx-auto mb-4"
                    />
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载图像
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-24 h-24 mx-auto mb-4 bg-[#203042]/30 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p>生成的图像将在这里显示</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Image;
