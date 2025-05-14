
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Login = () => {
  const { login, loginAsGuest, loading } = useAuth();
  const navigate = useNavigate();
  
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(emailOrUsername, password)) {
      navigate('/');
    }
  };
  
  const handleGuestLogin = async () => {
    setGuestLoading(true);
    if (await loginAsGuest()) {
      navigate('/');
    }
    setGuestLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="card-glowing p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gradient">登录 Nexus AI</h1>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-white mb-2">
                  用户名或邮箱
                </label>
                <Input
                  id="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  placeholder="输入用户名或邮箱"
                  required
                />
                <p className="text-xs text-white/60 mt-1">
                  可使用用户名或邮箱登录
                </p>
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
                  placeholder="输入密码"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white py-6"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录'}
              </Button>
              
              <div className="text-center text-white/70 pt-2">
                没有账号？{' '}
                <Link to="/register" className="text-nexus-cyan hover:underline">
                  注册
                </Link>
              </div>
              
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-white/40">或</span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>
              
              <Button
                type="button"
                onClick={handleGuestLogin}
                className="w-full bg-nexus-dark border border-nexus-blue/50 hover:bg-nexus-blue/20 text-nexus-cyan"
                disabled={guestLoading}
              >
                {guestLoading ? '正在创建游客账号...' : '以游客身份体验'}
              </Button>
              
              <p className="text-xs text-white/50 text-center">
                游客可免费体验：15次AI对话、30次图像生成、10次语音合成
              </p>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
