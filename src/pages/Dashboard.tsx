
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from '@/components/Navigation';
import { MessageSquare, Palette, Volume2, Crown, Settings, LogOut, User } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const getMembershipStatus = () => {
    if (user.role === 'admin') return '管理员';
    if (user.membershipType === 'lifetime') return '永久会员';
    if (user.membershipType === 'annual') return '年会员';
    return '普通用户';
  };

  const getMembershipExpiry = () => {
    if (user.membershipType === 'annual' && user.membershipExpiresAt) {
      return new Date(user.membershipExpiresAt).toLocaleDateString();
    }
    return null;
  };

  const services = [
    {
      icon: MessageSquare,
      title: "AI对话",
      description: "使用先进的AI模型进行自然语言对话",
      link: "/chat",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Palette,
      title: "AI图像生成",
      description: "使用AI技术创建惊艳的图像作品",
      link: "/image",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Volume2,
      title: "AI语音合成",
      description: "将文本转换为自然流畅的语音",
      link: "/voice",
      gradient: "from-green-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧用户信息 */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700 text-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">{user.name}</h2>
                    <p className="text-gray-400 text-sm mb-4">{user.email}</p>
                    
                    <div className="flex items-center justify-center mb-4">
                      {user.isVip && <Crown className="w-5 h-5 text-yellow-400 mr-2" />}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        user.isVip ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {getMembershipStatus()}
                      </span>
                    </div>
                    
                    {getMembershipExpiry() && (
                      <p className="text-xs text-gray-500 mb-4">
                        到期时间: {getMembershipExpiry()}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        账号设置
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        退出登录
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧内容 */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  个人中心
                </h1>
                <p className="text-gray-400">
                  欢迎, {user.name}
                </p>
              </div>

              {/* AI服务卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <Card key={index} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700 hover:border-gray-600 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-6">
                        <Link to={service.link} className="block">
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                            <p className="text-gray-400 text-sm">{service.description}</p>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* 升级会员 */}
              {!user.isVip && (
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">升级到VIP会员</h3>
                      <p className="text-gray-300 mb-6">
                        升级到VIP会员，享受无限次使用所有AI服务的特权
                      </p>
                      <Button 
                        asChild
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-medium text-lg"
                      >
                        <Link to="/payment">立即升级</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
