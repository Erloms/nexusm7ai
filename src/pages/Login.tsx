
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Login = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (await login(email, password)) {
      navigate('/');
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (registerPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不匹配');
      return;
    }
    
    setPasswordError('');
    
    if (await register(registerName, registerEmail, registerPassword)) {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="card-glowing p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Nexus AI</h1>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-nexus-dark/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-nexus-blue text-white">登录</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-nexus-blue text-white">注册</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      邮箱
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="输入您的邮箱"
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
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="输入您的密码"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-nexus-blue hover:text-nexus-cyan cursor-pointer">
                      忘记密码？
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white py-6"
                    disabled={loading}
                  >
                    {loading ? '登录中...' : '登录'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label htmlFor="register-name" className="block text-sm font-medium text-white mb-2">
                      姓名
                    </label>
                    <Input
                      id="register-name"
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="输入您的姓名"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="register-email" className="block text-sm font-medium text-white mb-2">
                      邮箱
                    </label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="输入您的邮箱"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="register-password" className="block text-sm font-medium text-white mb-2">
                      密码
                    </label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="设置密码（至少6位）"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
                      确认密码
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                      placeholder="再次输入密码"
                      required
                    />
                    {passwordError && (
                      <p className="mt-2 text-red-500 text-sm">{passwordError}</p>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white py-6"
                    disabled={loading}
                  >
                    {loading ? '注册中...' : '注册'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 text-center text-white/70 text-sm">
              <p>点击上方按钮即表示同意我们的</p>
              <p><Link to="#" className="text-nexus-cyan hover:underline">服务条款</Link> 和 <Link to="#" className="text-nexus-cyan hover:underline">隐私政策</Link></p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
