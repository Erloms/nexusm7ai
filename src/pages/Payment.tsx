import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('lifetime');

  // 预填写已登录用户的联系信息
  useEffect(() => {
    if (user?.email) {
      setContactInfo(user.email);
    }
  }, [user]);

  const handlePayment = () => {
    if (!contactInfo) {
      toast({
        title: "请输入联系方式",
        description: "请输入您的邮箱或手机号",
        variant: "destructive",
      });
      return;
    }
    
    // 生成订单号后四位
    const orderLastFour = Math.floor(1000 + Math.random() * 9000).toString();
    setOrderNumber(orderLastFour);
    
    toast({
      title: "支付信息已生成",
      description: "请按照以下信息完成支付",
    });
  };

  const planDetails = {
    annual: { price: '199', period: '/年', total: '199' },
    lifetime: { price: '799', period: '/永久', total: '799' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto bg-[#1a2740] border-[#203042]/60 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">选择支付套餐</h1>
          
          <div className="mb-6">
            <button
              className={`w-full p-4 mb-3 rounded border-2 ${selectedPlan === 'lifetime' ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-600'}`}
              onClick={() => setSelectedPlan('lifetime')}
            >
              <div className="text-white font-bold">永久会员 - ¥799</div>
            </button>
          </div>

          <div className="text-center bg-white p-4 rounded mb-4">
            <div className="text-lg font-bold mb-2">请使用支付宝扫码支付</div>
            <div className="text-2xl font-bold text-blue-600">¥{planDetails[selectedPlan].total}</div>
            <div className="text-sm text-gray-600 mt-2">订单号后四位: {orderNumber || '点击生成'}</div>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="联系方式（邮箱或手机号）"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="bg-[#14202c] border-[#2e4258] text-white"
            />
            
            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
            >
              生成支付信息
            </Button>
          </div>
        </div>
      </div>
    </div>
};

export default Payment;
