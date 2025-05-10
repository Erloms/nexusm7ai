
import React, { useState } from 'react';
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

  const handleManualVerification = () => {
    if (!orderNumber || orderNumber.length < 4) {
      toast({
        title: "请输入订单号后四位",
        description: "请输入支付宝订单号后四位进行验证",
        variant: "destructive",
      });
      return;
    }
    
    setVerifying(true);
    
    // Simulate payment verification process
    setTimeout(() => {
      setUserAsPaid();
      setVerifying(false);
      
      toast({
        title: "会员开通成功",
        description: "您已成功开通Nexus AI终身会员，即刻享受全部AI能力！",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 2000);
  };

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
                      <span className="text-gradient-gold text-3xl font-bold">¥99</span>
                    </div>
                    <div className="text-white/70 text-sm mt-2">* 一次付款，终身使用</div>
                  </div>
                </div>
              </div>
              
              {/* QR Code Section */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl mb-4 w-64 h-64 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/15ca2332-9aa6-40f7-bf1f-c6c30ecce77b.png" 
                    alt="支付宝收款码" 
                    className="max-w-full max-h-full"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-white font-bold mb-2">请使用支付宝扫码支付</p>
                  <p className="text-white/70 text-sm mb-4">
                    <span className="text-red-500 font-bold">重要：</span> 
                    请记住您的支付宝订单号后四位
                  </p>
                  
                  <div className="flex flex-col space-y-3 mb-4">
                    <div>
                      <label htmlFor="order-number" className="block text-sm font-medium text-white mb-1">
                        输入订单号后四位
                      </label>
                      <Input
                        id="order-number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        maxLength={4}
                        className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                        placeholder="例如：1234"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleManualVerification}
                    className="w-full bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
                    disabled={verifying}
                  >
                    {verifying ? '正在验证支付...' : '我已完成支付'}
                  </Button>
                  
                  <p className="text-white/50 text-xs mt-3">
                    支付验证后，系统将自动为您开通会员权限
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
