
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Sparkles, Star, Zap } from 'lucide-react';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');

  const planDetails = {
    annual: { 
      price: '99', 
      period: '/年', 
      total: '99',
      description: '年会员套餐',
      subtitle: '高性价比之选',
      features: [
        '20+顶尖AI大模型，无限次对话',
        'Flux全家桶，无限次图像生成',
        '无限次语音合成',
        '所有功能一年内免费使用',
        '优先技术支持'
      ]
    },
    lifetime: { 
      price: '399', 
      period: '/永久', 
      total: '399',
      description: '永久会员套餐',
      subtitle: '一次付费，终身享用',
      features: [
        '包含所有年会员功能',
        '永久免费使用所有AI功能',
        '专属VIP身份标识',
        '30%收益分成权益',
        '永久免费更新'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            选择会员套餐
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            解锁全部AI超能力，开启无限创作之旅
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-gray-300 ml-2">已有1000+用户选择我们</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Annual Plan */}
          <div 
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedPlan === 'annual' ? 'transform scale-105' : 'hover:scale-102'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl transition-opacity duration-300 ${
              selectedPlan === 'annual' ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <div className={`relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 ${
              selectedPlan === 'annual' 
                ? 'border-cyan-400 shadow-2xl shadow-cyan-500/25' 
                : 'border-gray-700 hover:border-gray-600'
            }`}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-cyan-400 mr-2" />
                  <h3 className="text-2xl font-bold text-white">{planDetails.annual.description}</h3>
                </div>
                <p className="text-gray-400 mb-6">{planDetails.annual.subtitle}</p>
                
                <div className="mb-6">
                  <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ¥{planDetails.annual.price}
                  </span>
                  <span className="text-gray-400 text-xl ml-2">/年</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-6">
                  平均每月仅需 ¥8.25
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {planDetails.annual.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              {selectedPlan === 'annual' && (
                <div className="text-center">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300">
                    <Zap className="w-5 h-5 mr-2" />
                    立即选择
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Lifetime Plan */}
          <div 
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedPlan === 'lifetime' ? 'transform scale-105' : 'hover:scale-102'
            }`}
            onClick={() => setSelectedPlan('lifetime')}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center shadow-lg">
                <Sparkles className="w-4 h-4 mr-1" />
                推荐
              </div>
            </div>
            
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl transition-opacity duration-300 ${
              selectedPlan === 'lifetime' ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <div className={`relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 ${
              selectedPlan === 'lifetime' 
                ? 'border-purple-400 shadow-2xl shadow-purple-500/25' 
                : 'border-gray-700 hover:border-gray-600'
            }`}>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-8 h-8 text-purple-400 mr-2" />
                  <h3 className="text-2xl font-bold text-white">{planDetails.lifetime.description}</h3>
                </div>
                <p className="text-gray-400 mb-6">{planDetails.lifetime.subtitle}</p>
                
                <div className="mb-6">
                  <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    ¥{planDetails.lifetime.price}
                  </span>
                  <span className="text-gray-400 text-xl ml-2">/永久</span>
                </div>
                
                <div className="text-sm text-gray-500 mb-6">
                  相当于4年年费，超值划算
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                {planDetails.lifetime.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              {selectedPlan === 'lifetime' && (
                <div className="text-center">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300">
                    <Zap className="w-5 h-5 mr-2" />
                    立即选择
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">立即开通</h3>
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                ¥{planDetails[selectedPlan].total}
              </div>
              <div className="text-gray-400">{planDetails[selectedPlan].description}</div>
            </div>

            {/* Payment QR Code */}
            <div className="bg-white rounded-2xl p-6 mb-8 flex justify-center">
              <img 
                src="/lovable-uploads/a0ec2427-9113-4553-9e8e-17170fae056b.png" 
                alt="支付宝支付二维码" 
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-sm mb-6">
                微信扫码支付，会员权限自动开通
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl text-lg transition-all duration-300"
              >
                确认支付
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
