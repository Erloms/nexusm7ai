
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');

  // 预填写已登录用户的联系信息
  useEffect(() => {
    if (user?.email) {
      setContactInfo(user.email);
    }
  }, [user]);

  const planDetails = {
    annual: { 
      price: '99', 
      period: '/年', 
      total: '99',
      description: '年会员 - 性价比之选',
      features: ['无限次AI对话', '无限次图像生成', '无限次语音合成', '优先客服支持']
    },
    lifetime: { 
      price: '399', 
      period: '/永久', 
      total: '399',
      description: '永久会员 - 一次付费终身享用',
      features: ['所有年会员功能', '永久免费更新', '专属VIP标识', '优先体验新功能', '30%收益分成']
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">选择会员套餐</h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* 年会员套餐 */}
            <div 
              className={`bg-[#1a2740] border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                selectedPlan === 'annual' ? 'border-cyan-400 bg-cyan-400/5' : 'border-[#203042]/60 hover:border-cyan-400/50'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{planDetails.annual.description}</h2>
                <div className="text-4xl font-bold text-cyan-400 mb-1">¥{planDetails.annual.total}</div>
                <div className="text-gray-400 mb-4">{planDetails.annual.period}</div>
                <div className="space-y-2 text-left">
                  {planDetails.annual.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 永久会员套餐 */}
            <div 
              className={`bg-[#1a2740] border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                selectedPlan === 'lifetime' ? 'border-cyan-400 bg-cyan-400/5' : 'border-[#203042]/60 hover:border-cyan-400/50'
              }`}
              onClick={() => setSelectedPlan('lifetime')}
            >
              <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                推荐
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{planDetails.lifetime.description}</h2>
                <div className="text-4xl font-bold text-cyan-400 mb-1">¥{planDetails.lifetime.total}</div>
                <div className="text-gray-400 mb-4">{planDetails.lifetime.period}</div>
                <div className="space-y-2 text-left">
                  {planDetails.lifetime.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mr-3"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 支付区域 */}
          <div className="max-w-md mx-auto bg-[#1a2740] border border-[#203042]/60 rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">扫码支付</h3>
              <div className="text-3xl font-bold text-cyan-400">¥{planDetails[selectedPlan].total}</div>
              <div className="text-gray-400 text-sm mt-1">{planDetails[selectedPlan].description}</div>
            </div>

            {/* 支付二维码区域 */}
            <div className="bg-white rounded-xl p-8 mb-6 flex justify-center">
              <img 
                src="/lovable-uploads/a0ec2427-9113-4553-9e8e-17170fae056b.png" 
                alt="支付宝支付二维码" 
                className="w-48 h-48 object-contain"
              />
            </div>

            {/* 联系方式输入 */}
            <div className="space-y-4">
              <Input
                placeholder="联系方式（邮箱或手机号）"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="bg-[#14202c] border-[#2e4258] text-white"
              />
              
              <div className="text-center text-gray-400 text-sm">
                支付完成后请联系客服激活会员权限
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
