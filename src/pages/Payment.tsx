
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');

  const planDetails = {
    annual: { 
      price: '99', 
      period: '/年', 
      total: '99',
      description: '年会员 - 性价比之选',
      features: [
        '20+顶尖大模型，无限次AI对话',
        'Flux全家桶，无限次图像生成',
        '无限次语音合成',
        '所有功能永久免费使用'
      ]
    },
    lifetime: { 
      price: '399', 
      period: '/永久', 
      total: '399',
      description: '永久会员 - 一次付费终身享用',
      features: [
        '包含所有年会员功能',
        '永久免费更新升级',
        '专属VIP身份标识',
        '30%收益分成权益'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">选择会员套餐</h1>
            <p className="text-xl text-gray-400">解锁全部AI超能力，开启无限创作之旅</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 年会员套餐 */}
            <div 
              className={`relative bg-gradient-to-br from-[#1a2740] to-[#243654] border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 ${
                selectedPlan === 'annual' ? 'border-cyan-400 shadow-cyan-400/30 shadow-2xl transform scale-105' : 'border-[#203042]/60 hover:border-cyan-400/50'
              }`}
              onClick={() => setSelectedPlan('annual')}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-cyan-400 mr-2" />
                  <h2 className="text-2xl font-bold text-white">{planDetails.annual.description}</h2>
                </div>
                <div className="text-5xl font-bold text-cyan-400 mb-2">¥{planDetails.annual.total}</div>
                <div className="text-gray-400 mb-8">{planDetails.annual.period}</div>
                
                <div className="space-y-4 text-left">
                  {planDetails.annual.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 永久会员套餐 */}
            <div 
              className={`relative bg-gradient-to-br from-[#1a2740] to-[#243654] border-2 rounded-3xl p-8 cursor-pointer transition-all duration-300 overflow-hidden ${
                selectedPlan === 'lifetime' ? 'border-cyan-400 shadow-cyan-400/30 shadow-2xl transform scale-105' : 'border-[#203042]/60 hover:border-cyan-400/50'
              }`}
              onClick={() => setSelectedPlan('lifetime')}
            >
              <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                推荐
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-cyan-400 mr-2" />
                  <h2 className="text-2xl font-bold text-white">{planDetails.lifetime.description}</h2>
                </div>
                <div className="text-5xl font-bold text-cyan-400 mb-2">¥{planDetails.lifetime.total}</div>
                <div className="text-gray-400 mb-8">{planDetails.lifetime.period}</div>
                
                <div className="space-y-4 text-left">
                  {planDetails.lifetime.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 支付区域 */}
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-[#1a2740] to-[#243654] border border-[#203042]/60 rounded-3xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">立即开通</h3>
                <div className="text-4xl font-bold text-cyan-400 mb-2">¥{planDetails[selectedPlan].total}</div>
                <div className="text-gray-400">{planDetails[selectedPlan].description}</div>
              </div>

              {/* 支付二维码 */}
              <div className="bg-white rounded-2xl p-6 mb-8 flex justify-center">
                <img 
                  src="/lovable-uploads/a0ec2427-9113-4553-9e8e-17170fae056b.png" 
                  alt="支付宝支付二维码" 
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  扫码支付后会员权限将自动开通
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                  >
                    确认支付
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
