
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, Sparkles, ArrowLeft, Copy } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Image = () => {
  const { toast } = useToast();
  const { user, checkPaymentStatus } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [width, setWidth] = useState('1024');
  const [height, setHeight] = useState('1024');
  const [seed, setSeed] = useState('-1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{id: number, prompt: string, image: string, timestamp: Date}>>([]);

  const modelOptions = [
    { id: 'flux', name: 'Flux', description: '通用创意' },
    { id: 'flux-pro', name: 'Flux Pro', description: '专业版' },
    { id: 'flux-realism', name: 'Flux Realism', description: '超真实效果' },
    { id: 'flux-anime', name: 'Flux Anime', description: '动漫风格' },
    { id: 'flux-3d', name: 'Flux 3D', description: '三维效果' },
    { id: 'flux-cablyai', name: 'Flux CablyAI', description: '创意艺术' },
    { id: 'turbo', name: 'Turbo', description: '极速生成' },
  ];

  const generateOptimizedPrompt = (userPrompt: string) => {
    if (userPrompt.length < 50) {
      return `${userPrompt}, high quality, detailed, beautiful, masterpiece, professional photography`;
    }
    return userPrompt;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "提示词不能为空",
        description: "请输入图像生成提示词",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const optimizedPrompt = generateOptimizedPrompt(prompt);
      const encodedPrompt = encodeURIComponent(optimizedPrompt);
      const randomSeed = seed === '-1' ? Math.floor(Math.random() * 100000) : seed;
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&model=${model}&nologo=true`;
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedImages([imageUrl]);
      
      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        prompt: prompt,
        image: imageUrl,
        timestamp: new Date()
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 11)]);
      
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

  const generateWithTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  const copyPrompt = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      toast({
        title: "已复制",
        description: "提示词已复制到剪贴板",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-32 px-8">
        <div className="max-w-7xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI 文本转图片
            </h1>
            <p className="text-gray-600 mb-8 text-xl leading-relaxed">
              输入文字，选择画图风格，一键生成文字转换为自然流畅的语音。<br />
              支持多种音色音调，帮您创建专业水准的图片内容。
            </p>
            <Button asChild className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg">
              <Link to="/">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* 左侧：语音生成 */}
            <div>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-10">
                  <h3 className="text-3xl font-bold mb-10 text-gray-800">语音生成</h3>
                  
                  {/* 选择语音风格 */}
                  <div className="mb-10">
                    <h4 className="text-lg font-medium mb-6 text-gray-700">选择画图风格</h4>
                    <p className="text-gray-500 text-sm mb-6">
                      每种模型都有其独特的画图风格和表现力，选择最适合您内容的模型
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {modelOptions.map((modelOption) => (
                        <div
                          key={modelOption.id}
                          onClick={() => setModel(modelOption.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            model === modelOption.id
                              ? 'border-cyan-400 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-gray-800 font-medium text-sm mb-1">{modelOption.name}</div>
                            <div className="text-gray-500 text-xs">{modelOption.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 输入文本 */}
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-700">输入文本</h4>
                      <Button
                        onClick={copyPrompt}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        复制
                      </Button>
                    </div>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="使用中国官方说明语法，如测试AI视频合成，可以直接文字转换前缀：请保持文本"
                      className="min-h-[200px] bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:border-cyan-400 text-base resize-none"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-gray-500 text-sm">字符数: {prompt.length}</p>
                      <p className="text-gray-500 text-sm">色彩节律: 不调整</p>
                    </div>
                  </div>

                  {/* 尺寸设置 */}
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div>
                      <h4 className="text-lg font-medium mb-4 text-gray-700">宽度</h4>
                      <Select value={width} onValueChange={setWidth}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="720">720</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                          <SelectItem value="1536">1536</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-4 text-gray-700">高度</h4>
                      <Select value={height} onValueChange={setHeight}>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-800 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="720">720</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                          <SelectItem value="1536">1536</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 种子设置 */}
                  <div className="mb-10">
                    <h4 className="text-lg font-medium mb-4 text-gray-700">种子数 (Seed)</h4>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 h-12"
                        placeholder="-1 (随机)"
                      />
                      <Button
                        onClick={() => setSeed('-1')}
                        variant="outline"
                        className="h-12 px-6"
                      >
                        随机
                      </Button>
                    </div>
                  </div>

                  {/* 生成按钮 */}
                  <div className="flex justify-between mb-8">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-4 text-lg h-14"
                    >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <Sparkles className="animate-spin h-5 w-5 mr-2" />
                          生成语音
                        </div>
                      ) : (
                        "生成语音"
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setPrompt('')}
                    >
                      按住对话 (Ctrl + ↵ Enter)
                    </Button>
                  </div>

                  {/* 使用小技巧 */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <h4 className="text-gray-800 font-medium mb-3 text-base">使用小技巧</h4>
                    <ul className="text-gray-600 text-sm space-y-2 list-disc pl-5">
                      <li>输入适当的可明确描述的音频的简话和语调变化</li>
                      <li>不同音频风格适合不同场景，可以尝试多种风格找到最适合的</li>
                      <li>大段文本可以分为多个短段，生成后合并，效果更佳</li>
                      <li>特殊专业术语可能需要注音或微调以获得更准确的发音</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：音频预览 */}
            <div>
              <Card className="bg-gray-50 border-gray-200 h-full">
                <CardContent className="p-10">
                  <h3 className="text-3xl font-bold mb-8 text-gray-800">音频预览</h3>
                  
                  {generatedImages.length > 0 ? (
                    <div className="space-y-6">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <img
                          src={generatedImages[0]}
                          alt="Generated image"
                          className="w-full h-96 object-cover"
                        />
                        <div className="p-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-gray-800 font-medium mb-1">生成完成</p>
                              <p className="text-gray-500 text-sm">模型: {modelOptions.find(m => m.id === model)?.name}</p>
                            </div>
                            <Button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = generatedImages[0];
                                link.download = 'ai-generated-image.png';
                                link.click();
                                toast({
                                  title: "下载开始",
                                  description: "图片文件下载已开始",
                                });
                              }}
                              className="bg-cyan-500 hover:bg-cyan-600"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              下载
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <p className="text-gray-500 text-lg">
                        {isGenerating ? '正在生成图片，请稍等...' : '尚未生成图片'}
                      </p>
                    </div>
                  )}

                  {/* 历史记录 */}
                  <div className="mt-10">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-2xl font-bold text-gray-800">历史记录</h4>
                      <Button 
                        variant="ghost" 
                        className="text-red-500 hover:text-red-600 text-sm bg-red-50 hover:bg-red-100"
                        onClick={() => setHistory([])}
                      >
                        清空记录
                      </Button>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-yellow-600 text-sm">
                        生成记录提醒：后台正在处理，请等待下载。
                      </p>
                    </div>

                    {history.length > 0 ? (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {history.map((item) => (
                          <div 
                            key={item.id}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex gap-4">
                              <img
                                src={item.image}
                                alt="History item"
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-cyan-600 font-medium text-sm">
                                    {item.timestamp.toLocaleString('zh-CN')}
                                  </span>
                                </div>
                                <p className="text-gray-800 text-sm mb-2 line-clamp-2">{item.prompt}</p>
                                <div className="flex justify-end">
                                  <Button 
                                    size="sm"
                                    className="bg-cyan-500 hover:bg-cyan-600 text-xs"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = item.image;
                                      link.download = `ai-image-${item.id}.png`;
                                      link.click();
                                    }}
                                  >
                                    下载
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">暂无历史记录</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Image;
