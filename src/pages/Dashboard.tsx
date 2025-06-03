
import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Volume2, 
  User, 
  Settings, 
  LogOut,
  BarChart3,
  Users,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, logout, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user.email === 'admin@nexusai.com' || user.name === '管理员';

  // 获取用户的使用额度信息
  const getUsageData = () => {
    if (checkPaymentStatus() || isAdmin) {
      return {
        chat: { used: 0, total: '无限制' },
        image: { used: 0, total: '无限制' },
        voice: { used: 0, total: '无限制' },
      };
    }
    
    const getServiceUsage = (serviceType: string) => {
      const usageData = localStorage.getItem(`nexusAi_${serviceType}_usage_${user.id}`);
      if (usageData) {
        const { remaining } = JSON.parse(usageData);
        return { used: 10 - remaining, total: 10 };
      }
      return { used: 0, total: 10 };
    };
    
    return {
      chat: getServiceUsage('chat'),
      image: getServiceUsage('image'),
      voice: getServiceUsage('voice'),
    };
  };

  const usageData = getUsageData();

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow container mx-auto my-20 px-4">
        <div className="flex flex-col md:flex-row gap-6 min-h-[70vh]">
          {/* 侧边栏 */}
          <div className="w-full md:w-64 bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-5">
            <div className="text-center mb-8">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-nexus-blue to-nexus-cyan mx-auto flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">{user.name}</h3>
              <div className="mt-2 text-sm text-white/70">{user.email || '未设置邮箱'}</div>
              {checkPaymentStatus() && (
                <div className="mt-2 bg-nexus-blue/20 text-nexus-cyan px-3 py-1 rounded-full text-xs inline-flex items-center">
                  VIP会员
                </div>
              )}
              {isAdmin && (
                <div className="mt-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs inline-flex items-center">
                  管理员
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80 mb-3">AI服务</h4>
              
              <Link to="/chat" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors">
                <MessageSquare className="h-5 w-5 text-nexus-cyan" />
                <span>AI对话</span>
              </Link>
              
              <Link to="/image" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors">
                <ImageIcon className="h-5 w-5 text-nexus-cyan" />
                <span>AI图像生成</span>
              </Link>
              
              <Link to="/voice" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors">
                <Volume2 className="h-5 w-5 text-nexus-cyan" />
                <span>AI语音合成</span>
              </Link>
              
              {isAdmin && (
                <>
                  <h4 className="text-sm font-medium text-white/80 mb-2 mt-4 pt-4 border-t border-nexus-blue/20">管理员功能</h4>
                  <Link to="/admin" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors">
                    <BarChart3 className="h-5 w-5 text-red-400" />
                    <span>控制台</span>
                  </Link>
                  <Link to="/admin/users" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors">
                    <Users className="h-5 w-5 text-red-400" />
                    <span>用户管理</span>
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-8 pt-4 border-t border-nexus-blue/20">
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors cursor-pointer" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5 text-nexus-cyan" />
                <span>账号设置</span>
              </div>
              
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-nexus-blue/20 text-white transition-colors cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-nexus-cyan" />
                <span>退出登录</span>
              </div>
            </div>
            
            {/* 免费用户额度限制显示 */}
            {!checkPaymentStatus() && !isAdmin && (
              <div className="mt-8 pt-4 border-t border-nexus-blue/20 text-xs text-white/60 space-y-2">
                <div className="flex justify-between">
                  <span>AI对话额度:</span>
                  <span>{usageData.chat.used} / {usageData.chat.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI图像额度:</span>
                  <span>{usageData.image.used} / {usageData.image.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>AI语音额度:</span>
                  <span>{usageData.voice.used} / {usageData.voice.total}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 主内容区域 */}
          <div className="flex-grow">
            <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
              <h2 className="text-2xl font-bold mb-6 text-gradient">{isAdmin ? '管理员控制台' : '个人中心'}</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-white">欢迎{isAdmin ? '管理员' : ''}, {user.name}</h3>
                  <p className="text-white/80">{isAdmin ? '管理系统与用户' : '选择以下AI服务开始使用：'}</p>
                  
                  {/* AI服务卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Link to="/chat" className="block p-6 rounded-lg bg-nexus-dark/60 border border-nexus-blue/30 hover:border-nexus-blue/60 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-nexus-blue/20 flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-nexus-cyan" />
                        </div>
                        <h4 className="font-bold text-lg text-gradient">AI对话</h4>
                      </div>
                      <p className="text-sm text-white/70">使用先进的AI模型进行自然语言对话</p>
                    </Link>
                    
                    <Link to="/image" className="block p-6 rounded-lg bg-nexus-dark/60 border border-nexus-blue/30 hover:border-nexus-blue/60 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-nexus-blue/20 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-nexus-cyan" />
                        </div>
                        <h4 className="font-bold text-lg text-gradient">AI图像生成</h4>
                      </div>
                      <p className="text-sm text-white/70">使用AI技术创建惊人的图像和艺术作品</p>
                    </Link>
                    
                    <Link to="/voice" className="block p-6 rounded-lg bg-nexus-dark/60 border border-nexus-blue/30 hover:border-nexus-blue/60 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-nexus-blue/20 flex items-center justify-center">
                          <Volume2 className="h-6 w-6 text-nexus-cyan" />
                        </div>
                        <h4 className="font-bold text-lg text-gradient">AI语音合成</h4>
                      </div>
                      <p className="text-sm text-white/70">将文本转换为自然流畅的语音</p>
                    </Link>
                  </div>
                </div>
                
                {/* 管理员特殊功能 */}
                {isAdmin && (
                  <div className="p-6 rounded-lg bg-nexus-dark/60 border border-red-500/30">
                    <h3 className="text-xl font-bold mb-4 text-red-400">管理员功能</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link to="/admin" className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <BarChart3 className="h-6 w-6 text-red-400" />
                        <div>
                          <h4 className="font-medium text-white">系统控制台</h4>
                          <p className="text-sm text-white/60">查看系统统计和管理</p>
                        </div>
                      </Link>
                      <Link to="/admin/users" className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                        <Users className="h-6 w-6 text-red-400" />
                        <div>
                          <h4 className="font-medium text-white">用户管理</h4>
                          <p className="text-sm text-white/60">管理用户和VIP权限</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* 非会员升级提示 */}
                {!checkPaymentStatus() && !isAdmin && (
                  <div className="p-6 rounded-lg bg-nexus-dark/60 border border-nexus-blue/30">
                    <h3 className="text-xl font-bold mb-4 text-white">升级到VIP会员</h3>
                    <p className="text-white/80 mb-4">升级到VIP会员，享受无限次使用所有AI服务的特权</p>
                    <div className="flex gap-4">
                      <Button 
                        asChild
                        className="bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
                      >
                        <Link to="/payment">
                          <CreditCard className="mr-2 h-4 w-4" />
                          立即升级
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
