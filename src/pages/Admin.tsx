
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PaymentRequests from '@/components/PaymentRequests';
import UserManagement from '@/components/UserManagement';

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 处理管理员登录
  const handleAdminLogin = () => {
    setIsLoggingIn(true);
    
    setTimeout(() => {
      if (username === 'Master' && password === 'Mengzhen888') {
        setIsAdmin(true);
        toast({
          title: "管理员登录成功",
          description: "欢迎回来，管理员",
        });
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive",
        });
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  // 如果用户不是管理员，显示登录页面
  if (!isAdmin && user?.name !== '管理员') {
    return (
      <div className="min-h-screen bg-nexus-dark flex flex-col">
        <Navigation />
        
        <div className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            <div className="card-glowing p-8">
              <h1 className="text-3xl font-bold text-center mb-8 text-gradient">管理员登录</h1>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                    用户名
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    placeholder="请输入管理员用户名"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    密码
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    placeholder="请输入管理员密码"
                    required
                  />
                </div>
                
                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '登录中...' : '登录'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // 管理员面板
  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow px-4 py-20">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gradient">管理员控制面板</h1>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-nexus-dark/50 border border-nexus-blue/30 mb-6">
              <TabsTrigger value="users" className="data-[state=active]:bg-nexus-blue text-white">
                用户管理
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-nexus-blue text-white">
                支付管理
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-nexus-blue text-white">
                系统设置
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="payments" className="mt-6">
              <PaymentRequests />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <div className="p-8 text-center text-white bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg">
                系统设置功能正在开发中...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;
