
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Settings as SettingsIcon, User, Key, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    toast({
      title: "设置已保存",
      description: "您的设置已成功更新",
    });
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "密码已更新",
      description: "您的密码已成功更改",
    });
    
    setFormData({
      ...formData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-white">用户名</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
              />
            </div>
            <Button onClick={handleSave} className="bg-nexus-blue hover:bg-nexus-blue/80">
              保存更改
            </Button>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="currentPassword" className="text-white">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-white">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white">确认新密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
              />
            </div>
            <Button onClick={handlePasswordChange} className="bg-nexus-blue hover:bg-nexus-blue/80">
              更新密码
            </Button>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-nexus-dark/50 p-4 rounded-lg border border-nexus-blue/20">
              <h3 className="text-white font-bold mb-2">通知设置</h3>
              <p className="text-white/70">
                通知功能开发中，敬请期待...
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <main className="flex-grow p-4 pt-16 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gradient mb-8 flex items-center">
            <SettingsIcon className="mr-3 h-8 w-8" />
            设置
          </h1>
          
          <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6">
            {/* 标签导航 */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile' 
                    ? 'bg-nexus-blue text-white' 
                    : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                个人资料
              </Button>
              
              <Button
                variant={activeTab === 'security' ? 'default' : 'outline'}
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security' 
                    ? 'bg-nexus-blue text-white' 
                    : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
                }`}
              >
                <Shield className="h-4 w-4 mr-2" />
                安全设置
              </Button>
              
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'outline'}
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications' 
                    ? 'bg-nexus-blue text-white' 
                    : 'bg-transparent border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20'
                }`}
              >
                <Bell className="h-4 w-4 mr-2" />
                通知设置
              </Button>
            </div>
            
            {/* 标签内容 */}
            {renderTabContent()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
