
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('两次输入的密码不匹配');
      return;
    }
    
    setPasswordError('');
    
    // Use account as both name and email
    if (await register(account, account, password)) {
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="card-glowing p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gradient">注册 Nexus AI</h1>
            
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="account" className="block text-sm font-medium text-white mb-2">
                  账号
                </label>
                <Input
                  id="account"
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50 focus:border-nexus-blue"
                  placeholder="手机号/邮箱"
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
                  placeholder="设置密码（至少6位）"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  确认密码
                </label>
                <Input
                  id="confirmPassword"
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
              
              <div className="text-center text-white/70">
                已有账号？{' '}
                <Link to="/login" className="text-nexus-cyan hover:underline">
                  登录
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
