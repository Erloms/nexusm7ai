
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MessageSquare, Image, Volume2, Rocket, User } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, isAuthenticated, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = React.useState({
    chat: { used: 0, total: 10 },
    image: { used: 0, total: 10 },
    voice: { used: 0, total: 10 }
  });

  // 如果用户未登录，重定向到登录页面
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    if (user) {
      // 从本地存储获取使用统计
      try {
        const chatUsage = JSON.parse(localStorage.getItem(`nexusAi_chat_usage_${user.id}`) || '{"remaining": 10}');
        const imageUsage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
        const voiceUsage = JSON.parse(localStorage.getItem(`nexusAi_voice_usage_${user.id}`) || '{"remaining": 10}');
        
        setUsageStats({
          chat: { used: 10 - chatUsage.remaining, total: 10 },
          image: { used: 10 - imageUsage.remaining, total: 10 },
          voice: { used: 10 - voiceUsage.remaining, total: 10 }
        });
      } catch (error) {
        console.error("Error loading usage stats:", error);
      }
    }
  }, [user]);

  const calculatePercentage = (used: number, total: number) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const handleUpgrade = () => {
    navigate('/payment');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow container mx-auto py-20">
        <SidebarProvider>
          <div className="flex w-full min-h-[600px] bg-nexus-dark/80 border border-nexus-blue/30 rounded-lg overflow-hidden">
            <Sidebar className="w-64 border-r border-nexus-blue/30 bg-nexus-dark/50">
              <SidebarHeader className="p-4 border-b border-nexus-blue/30">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-nexus-cyan" />
                  <span className="text-lg font-medium text-white">{user?.name}</span>
                </div>
              </SidebarHeader>
              
              <SidebarContent>
                <SidebarGroup>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white/70 mb-3">AI服务</h3>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/chat" className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-nexus-cyan" />
                            <span>AI对话</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/image" className="flex items-center space-x-2">
                            <Image className="h-4 w-4 text-nexus-cyan" />
                            <span>AI图像生成</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/voice" className="flex items-center space-x-2">
                            <Volume2 className="h-4 w-4 text-nexus-cyan" />
                            <span>AI语音合成</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </div>
                </SidebarGroup>
              </SidebarContent>
              
              <SidebarFooter className="p-4 border-t border-nexus-blue/30">
                {!checkPaymentStatus() && (
                  <>
                    <div className="mb-3 px-2">
                      <h3 className="text-xs font-medium text-white/50 mb-2">免费额度</h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-white/70 mb-1">
                            <span>AI对话</span>
                            <span>{usageStats.chat.used}/{usageStats.chat.total}</span>
                          </div>
                          <Progress 
                            value={calculatePercentage(usageStats.chat.used, usageStats.chat.total)} 
                            className="h-1 bg-nexus-blue/20" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-white/70 mb-1">
                            <span>AI图像生成</span>
                            <span>{usageStats.image.used}/{usageStats.image.total}</span>
                          </div>
                          <Progress 
                            value={calculatePercentage(usageStats.image.used, usageStats.image.total)} 
                            className="h-1 bg-nexus-blue/20" 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-white/70 mb-1">
                            <span>AI语音合成</span>
                            <span>{usageStats.voice.used}/{usageStats.voice.total}</span>
                          </div>
                          <Progress 
                            value={calculatePercentage(usageStats.voice.used, usageStats.voice.total)} 
                            className="h-1 bg-nexus-blue/20" 
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleUpgrade} 
                      className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                      size="sm"
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      升级会员
                    </Button>
                  </>
                )}
              </SidebarFooter>
            </Sidebar>
            
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gradient">个人中心</h1>
                <p className="text-white/70">欢迎回来，{user?.name}</p>
              </div>
              
              <div className="space-y-6">
                {checkPaymentStatus() ? (
                  <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">VIP会员</h2>
                      <p className="text-white/80">您已是VIP会员，享有无限使用权限</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gradient-to-br from-nexus-blue/10 to-nexus-purple/10 border border-nexus-blue/30">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-white mb-2">会员权益</h2>
                      <p className="text-white/80 mb-4">升级VIP，畅享无限AI服务，解锁全部高级功能</p>
                      <Button 
                        onClick={handleUpgrade} 
                        className="bg-nexus-blue hover:bg-nexus-blue/80"
                      >
                        立即升级
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
