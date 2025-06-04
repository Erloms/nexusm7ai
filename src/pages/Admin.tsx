
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UserManagement from '@/components/UserManagement';
import AlipayConfig from '@/components/AlipayConfig';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Users, Settings, BarChart, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
}

const Admin = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('users');

  // 检查是否为管理员
  const isAdmin = user && user.email === 'morphy.realm@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      // 加载用户数据
      const userData = localStorage.getItem('nexusAi_users');
      if (userData) {
        setUsers(JSON.parse(userData));
      }
    }
  }, [isAdmin]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement users={users} setUsers={setUsers} />;
      case 'alipay':
        return <AlipayConfig />;
      case 'statistics':
        return (
          <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
            <div className="flex items-center mb-6">
              <BarChart className="mr-3 h-6 w-6 text-nexus-cyan" />
              <h2 className="text-2xl font-bold text-gradient">统计数据</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">总用户数</h3>
                <p className="text-3xl font-bold text-white">{users.length}</p>
              </div>
              
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">付费用户</h3>
                <p className="text-3xl font-bold text-white">{users.filter(u => u.isPaid).length}</p>
              </div>
              
              <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
                <h3 className="text-lg font-bold text-nexus-cyan mb-2">免费用户</h3>
                <p className="text-3xl font-bold text-white">{users.filter(u => !u.isPaid).length}</p>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">用户增长趋势</h3>
              <div className="bg-nexus-dark/30 p-4 rounded-lg border border-nexus-blue/20">
                <p className="text-white/70">图表功能开发中...</p>
              </div>
            </div>
          </div>
        );
      default:
        return <UserManagement users={users} setUsers={setUsers} />;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow p-4 pt-16 md:p-8">
        <div className="w-full max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gradient mb-8">管理员仪表板</h1>
          
          {/* 标签导航 */}
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
              用户管理
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
              支付宝配置
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
              统计数据
            </Button>
          </div>
          
          {/* 标签内容 */}
          {renderTabContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
