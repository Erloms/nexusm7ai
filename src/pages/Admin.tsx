
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdminUserManagement from '@/components/AdminUserManagement';
import AlipayConfig from '@/components/AlipayConfig';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Users, Settings, BarChart, CreditCard, Shield, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
  registrationDate: string;
  usage: {
    chat: number;
    image: number;
    voice: number;
  };
}

const Admin = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('users');

  // Check if user is admin
  const isAdmin = user && user.email === 'morphy.realm@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadUserData();
    }
  }, [isAdmin]);

  const loadUserData = () => {
    const userData = localStorage.getItem('nexusAi_users');
    if (userData) {
      const userList = JSON.parse(userData);
      const usersWithStats = userList.map((user: any) => {
        const chatUsage = parseInt(localStorage.getItem(`chat_usage_${user.id}`) || '0');
        const imageUsage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
        const voiceUsage = JSON.parse(localStorage.getItem(`nexusAi_voice_usage_${user.id}`) || '{"remaining": 10}');
        
        return {
          ...user,
          registrationDate: user.registrationDate || new Date().toISOString(),
          usage: {
            chat: chatUsage,
            image: 10 - imageUsage.remaining,
            voice: 10 - voiceUsage.remaining
          }
        };
      });
      setUsers(usersWithStats);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminUserManagement users={users} setUsers={setUsers} />;
      case 'alipay':
        return <AlipayConfig />;
      case 'statistics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">总用户数</h3>
                <p className="text-3xl font-bold text-white">{users.length}</p>
                <p className="text-sm text-white/60 mt-1">注册用户总数</p>
              </div>
              
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">VIP用户</h3>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.isPaid).length}</p>
                <p className="text-sm text-white/60 mt-1">付费用户数量</p>
              </div>
              
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">转化率</h3>
                <p className="text-3xl font-bold text-white">
                  {users.length > 0 ? ((users.filter(u => u.isPaid).length / users.length) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-white/60 mt-1">用户转化率</p>
              </div>

              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">总收入</h3>
                <p className="text-3xl font-bold text-white">¥{users.filter(u => u.isPaid).length * 799}</p>
                <p className="text-sm text-white/60 mt-1">累计收入金额</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-xl font-bold text-white mb-4">AI对话使用情况</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">总对话次数:</span>
                    <span className="text-white font-bold">
                      {users.reduce((sum, user) => sum + user.usage.chat, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">平均每用户:</span>
                    <span className="text-white font-bold">
                      {users.length > 0 ? (users.reduce((sum, user) => sum + user.usage.chat, 0) / users.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-xl font-bold text-white mb-4">AI图像使用情况</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">总生成次数:</span>
                    <span className="text-white font-bold">
                      {users.reduce((sum, user) => sum + user.usage.image, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">平均每用户:</span>
                    <span className="text-white font-bold">
                      {users.length > 0 ? (users.reduce((sum, user) => sum + user.usage.image, 0) / users.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-xl font-bold text-white mb-4">AI语音使用情况</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">总合成次数:</span>
                    <span className="text-white font-bold">
                      {users.reduce((sum, user) => sum + user.usage.voice, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">平均每用户:</span>
                    <span className="text-white font-bold">
                      {users.length > 0 ? (users.reduce((sum, user) => sum + user.usage.voice, 0) / users.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminUserManagement users={users} setUsers={setUsers} />;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow p-4 pt-16 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <Shield className="mr-3 h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gradient">管理员控制台</h1>
            <span className="ml-4 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-300 text-sm">
              仅限管理员访问
            </span>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users' 
                  ? 'bg-nexus-blue text-white' 
                  : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              会员管理
            </Button>
            
            <Button
              variant={activeTab === 'alipay' ? 'default' : 'outline'}
              onClick={() => setActiveTab('alipay')}
              className={`${
                activeTab === 'alipay' 
                  ? 'bg-nexus-blue text-white' 
                  : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
              }`}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              支付宝MCP设置
            </Button>
            
            <Button
              variant={activeTab === 'statistics' ? 'default' : 'outline'}
              onClick={() => setActiveTab('statistics')}
              className={`${
                activeTab === 'statistics' 
                  ? 'bg-nexus-blue text-white' 
                  : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
              }`}
            >
              <BarChart className="h-4 w-4 mr-2" />
              数据统计
            </Button>
          </div>
          
          {/* Tab Content */}
          <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
