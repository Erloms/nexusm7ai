
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Loader2, Upload, Video, Play, Download, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VideoGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [quality, setQuality] = useState('quality');
  const [withAudio, setWithAudio] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过5MB",
          variant: "destructive"
        });
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录账户才能使用视频生成功能",
        variant: "destructive"
      });
      return;
    }

    if (!imageFile && !prompt.trim()) {
      toast({
        title: "请选择图片或输入文本",
        description: "至少需要提供图片或文本描述之一",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 模拟CogVideoX API调用
      const formData = new FormData();
      
      const requestBody: any = {
        model: "cogvideox-flash",
        quality: quality,
        with_audio: withAudio,
        request_id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      if (prompt.trim()) {
        requestBody.prompt = prompt;
      }

      if (imageFile) {
        // 将图片转为base64
        const base64 = imagePreview?.split(',')[1];
        requestBody.image_url = `data:${imageFile.type};base64,${base64}`;
      }

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 模拟返回的任务ID
      const mockTaskId = `task_${Date.now()}`;
      setTaskId(mockTaskId);
      
      // 模拟轮询结果
      setTimeout(async () => {
        // 模拟生成的视频URL
        const mockVideoUrl = "https://sfile.chatglm.cn/testpath/video/sample_video.mp4";
        setGeneratedVideo(mockVideoUrl);
        setIsLoading(false);
        
        toast({
          title: "视频生成成功",
          description: "您的视频已准备就绪！",
        });
      }, 8000);
      
      toast({
        title: "视频生成中",
        description: "正在处理您的请求，预计需要1-2分钟",
      });
      
    } catch (error) {
      console.error('视频生成失败:', error);
      setIsLoading(false);
      toast({
        title: "生成失败",
        description: "视频生成过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    }
  };

  const downloadVideo = () => {
    if (generatedVideo) {
      const link = document.createElement('a');
      link.href = generatedVideo;
      link.download = `nexus-ai-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
              AI 视频生成器
            </h1>
            <p className="text-gray-400 text-lg">
              基于 CogVideoX 的强大视频生成能力 - 文本转视频 & 图片转视频
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-cyan-400" />
                    上传图片 (可选)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-[#203042]/60 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="预览"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-400">{imageFile?.name}</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="border-[#203042]/60 text-gray-400"
                        >
                          重新选择
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                        <div>
                          <p className="text-white mb-2">点击上传图片</p>
                          <p className="text-sm text-gray-500">支持 PNG, JPG, JPEG 格式，最大 5MB</p>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="bg-[#0f1419] border-[#203042]/60"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Text Prompt */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white">文本描述 (可选)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要生成的视频内容..."
                    className="bg-[#0f1419] border-[#203042]/60 text-white min-h-[100px]"
                    maxLength={512}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {prompt.length}/512 字符
                  </p>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">生成设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-white text-sm mb-2">输出质量</label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="bg-[#0f1419] border-[#203042]/60 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2740] border-[#203042]/60">
                        <SelectItem value="quality" className="text-white">质量优先</SelectItem>
                        <SelectItem value="speed" className="text-white">速度优先</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-white text-sm">生成音效</label>
                    <button
                      onClick={() => setWithAudio(!withAudio)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        withAudio ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          withAudio ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={generateVideo}
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
                    <Video className="mr-2 h-4 w-4" />
                    生成视频
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel - Preview */}
            <div>
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white">视频预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-[#0f1419] border-[#203042]/60 border rounded-lg flex items-center justify-center min-h-[300px]">
                    {isLoading ? (
                      <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin mb-4" />
                        <p className="text-gray-400">正在生成您的专属视频...</p>
                        {taskId && (
                          <p className="text-sm text-gray-500 mt-2">任务ID: {taskId}</p>
                        )}
                      </div>
                    ) : generatedVideo ? (
                      <div className="w-full">
                        <video
                          src={generatedVideo}
                          controls
                          className="w-full rounded-lg mb-4"
                          poster="https://sfile.chatglm.cn/testpath/video_cover/sample_cover.png"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button 
                            onClick={downloadVideo}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载视频
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <div className="w-24 h-24 mx-auto mb-4 bg-[#203042]/30 rounded-lg flex items-center justify-center">
                          <Play className="w-12 h-12" />
                        </div>
                        <p>生成的视频将在这里显示</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGeneration;
