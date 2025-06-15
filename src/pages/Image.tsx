
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Image = () => {
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-schnell');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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
      
      // Mock generated image (using a placeholder)
      setGeneratedImage(`https://picsum.photos/800/600?random=${Date.now()}`);
      
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

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nexus-ai-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "下载成功",
      description: "图像已保存到您的设备",
    });
  };

  const getRemainingUsage = () => {
    if (checkPaymentStatus()) return '无限制';
    const usageKey = `nexusAi_image_usage_${user?.id}`;
    const usage = JSON.parse(localStorage.getItem(usageKey) || '{"remaining": 10}');
    return usage.remaining;
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-nexus-blue to-nexus-cyan flex items-center justify-center mr-4">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">AI 图像生成</h1>
            </div>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              使用先进的AI技术，将您的创意想法转化为精美的图像作品
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 左侧：控制面板 */}
            <div className="space-y-8">
              <Card className="bg-nexus-dark/50 border-nexus-blue/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="mr-2 h-5 w-5 text-nexus-cyan" />
                    生成设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">描述提示词</label>
                    <Textarea
                      placeholder="描述您想要生成的图像，例如：一只可爱的小猫坐在彩虹桥上，卡通风格，高清画质"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-32 bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">模型选择</label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-nexus-dark/50 border-nexus-blue/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-nexus-dark border-nexus-blue/30">
                        <SelectItem value="flux-schnell">FLUX Schnell (快速版)</SelectItem>
                        <SelectItem value="flux-dev">FLUX Dev (开发版)</SelectItem>
                        <SelectItem value="flux-pro">FLUX Pro (专业版)</SelectItem>
                        <SelectItem value="flux-realism">FLUX Realism (写实版)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-nexus-blue/10 rounded-lg border border-nexus-blue/20">
                    <div>
                      <p className="text-white font-medium">剩余次数</p>
                      <p className="text-nexus-cyan text-sm">{getRemainingUsage()}</p>
                    </div>
                    <div>
                      <Sparkles className="h-6 w-6 text-nexus-cyan" />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white py-6 text-lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        生成中...
                      </div>
                    ) : (
                      '开始生成'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：结果展示 */}
            <div>
              <Card className="bg-nexus-dark/50 border-nexus-blue/30 h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <ImageIcon className="mr-2 h-5 w-5 text-nexus-cyan" />
                      生成结果
                    </span>
                    {generatedImage && (
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-nexus-dark/30 border-2 border-dashed border-nexus-blue/30 rounded-lg flex items-center justify-center">
                    {generatedImage ? (
                      <img
                        src={generatedImage}
                        alt="Generated Image"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                        <p className="text-white/50">
                          {isGenerating ? '正在生成您的图像...' : '生成的图像将在这里显示'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 示例提示词 */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">创意提示词示例</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "未来主义城市景观，霓虹灯闪烁，赛博朋克风格",
                "梦幻森林中的精灵小屋，发光的蘑菇，魔法氛围",
                "太空中的宇航员，地球背景，超现实主义风格",
                "日式庭院，樱花飞舞，传统建筑，春日暖阳",
                "机械朋克风格的机器人，工业背景，金属质感",
                "海底世界，五彩斑斓的珊瑚，神秘海洋生物"
              ].map((example, index) => (
                <Card key={index} className="bg-nexus-dark/30 border-nexus-blue/20 cursor-pointer hover:border-nexus-blue/50 transition-colors">
                  <CardContent className="p-4">
                    <p 
                      className="text-white/80 text-sm cursor-pointer"
                      onClick={() => setPrompt(example)}
                    >
                      {example}
                    </p>
                  </CardContent>
                </Card>
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
