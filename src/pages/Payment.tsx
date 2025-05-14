
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Payment = () => {
  const { user, setUserAsPaid } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 预填写已登录用户的联系信息
  useEffect(() => {
    if (user?.email) {
      setContactInfo(user.email);
    }
  }, [user]);

  const handleManualVerification = () => {
    if (!orderNumber || orderNumber.length < 4) {
      toast({
        title: "请输入订单号后四位",
        description: "请输入支付宝订单号后四位进行验证",
        variant: "destructive",
      });
      return;
    }

    if (!contactInfo) {
      toast({
        title: "请输入联系方式",
        description: "请输入您的邮箱或手机号，用于确认支付",
        variant: "destructive",
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    
    if (!emailRegex.test(contactInfo) && !phoneRegex.test(contactInfo)) {
      toast({
        title: "联系方式格式错误",
        description: "请输入正确的邮箱或手机号格式",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    
    // 模拟提交到后台的过程，不再自动验证成功
    setTimeout(() => {
      // 在实际项目中，这里应该调用API保存订单信息
      
      setVerifying(false);
      setIsSubmitted(true);
      
      toast({
        title: "提交成功",
        description: "您的支付信息已提交，管理员将在24小时内审核并开通会员，请留意您的邮箱或手机通知。",
      });
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-nexus-dark flex flex-col">
        <Navigation />
        
        <div className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            <div className="card-glowing p-8 text-center">
              <div className="w-20 h-20 bg-nexus-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-nexus-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gradient mb-4">支付信息已提交</h2>
              
              <p className="text-white mb-6">
                感谢您的支付！管理员将在24小时内审核并开通您的会员权限。
                <br /><br />
                我们会通过您提供的联系方式 <span className="text-nexus-cyan">{contactInfo}</span> 通知您。
              </p>
              
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl">
          <div className="card-glowing p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Nexus AI 会员支付</h1>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Payment Info Section */}
              <div className="flex-1">
                <div className="bg-gradient-to-br from-nexus-dark/50 to-nexus-purple/20 rounded-lg p-6 backdrop-blur-sm border border-nexus-blue/30">
                  <h2 className="text-2xl font-bold text-gradient-gold mb-4">终身会员特权</h2>
                  
                  <ul className="space-y-4 text-white">
                    <li className="flex items-start">
                      <div className="mr-3 bg-gradient-to-r from-nexus-blue to-nexus-cyan w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-1">
                        <span className="text-sm">✓</span>
                      </div>
                      <span>使用全部最先进的AI大模型，GPT-4o、GPT-4.1、Gemini等一应俱全</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 bg-gradient-to-r from-nexus-blue to-nexus-cyan w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-1">
                        <span className="text-sm">✓</span>
                      </div>
                      <span>高质量AI图像生成，支持多种风格和效果</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 bg-gradient-to-r from-nexus-blue to-nexus-cyan w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-1">
                        <span className="text-sm">✓</span>
                      </div>
                      <span>专业级AI语音合成，多种声音风格可选</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 bg-gradient-to-r from-nexus-blue to-nexus-cyan w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-1">
                        <span className="text-sm">✓</span>
                      </div>
                      <span>终身会员权益，持续享受模型更新</span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 bg-gradient-to-r from-nexus-blue/20 to-nexus-cyan/20 p-4 rounded-lg border border-nexus-blue/30">
                    <div className="flex items-center justify-between">
                      <span className="text-white">普通会员价格</span>
                      <span className="text-white line-through">¥999</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white font-bold">Nexus AI 特惠价</span>
                      <span className="text-gradient-gold text-3xl font-bold">¥299</span>
                    </div>
                    <div className="text-white/70 text-sm mt-2">* 一次付款，终身使用</div>
                  </div>
                </div>
              </div>
              
              {/* QR Code Section */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl mb-4 w-64 h-64 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/57dcc2a2-00e1-41ff-8247-2ae008afe9d8.png" 
                    alt="支付宝收款码" 
                    className="max-w-full max-h-full"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-white font-bold mb-2">请使用支付宝扫码支付</p>
                  <p className="text-white/70 text-sm mb-4">
                    <span className="text-red-500 font-bold">重要：</span> 
                    请在下方输入支付宝订单号后四位和联系方式
                  </p>
                  
                  <div className="flex flex-col space-y-3 mb-4">
                    <div>
                      <label htmlFor="order-number" className="block text-sm font-medium text-white mb-1">
                        请输入订单号后四位
                      </label>
                      <Input
                        id="order-number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        maxLength={4}
                        className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                        placeholder="请输入4位数字"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="contact-info" className="block text-sm font-medium text-white mb-1">
                        请输入联系方式（邮箱或手机号）
                      </label>
                      <Input
                        id="contact-info"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                        placeholder="用于确认支付和登录"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleManualVerification}
                    className="w-full bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
                    disabled={verifying}
                  >
                    {verifying ? '正在提交...' : '提交支付信息'}
                  </Button>
                  
                  <p className="text-white/50 text-xs mt-3">
                    提交后，管理员将在24小时内审核并开通会员
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;
