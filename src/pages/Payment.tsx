
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Sparkles, Star, Zap, Users, X, CreditCard, Smartphone } from 'lucide-react';
import { createPaymentRequest, PaymentParams } from '@/utils/paymentService';

const Payment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime' | 'agent'>('annual');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'manual'>('alipay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
        '专属会员身份标识'
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
        '无限制访问新功能',
        '永久免费功能更新'
      ]
    },
    agent: { 
      price: '1999', 
      period: '/代理', 
      total: '1999',
      description: '代理商套餐',
      subtitle: '创业合作首选',
      features: [
        '包含所有永久会员功能',
        '30%推广收益分成',
        '专属代理商后台',
        '营销素材支持',
        '自动分成系统'
      ]
    }
  };

  const handlePurchase = (plan: 'annual' | 'lifetime' | 'agent') => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setIsProcessingPayment(false);
  };

  const handleAlipayPayment = async () => {
    if (!user?.id) {
      toast({
        title: "请先登录",
        description: "需要登录后才能购买会员",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const paymentParams: PaymentParams = {
        amount: planDetails[selectedPlan].total,
        planName: planDetails[selectedPlan].description,
        planType: selectedPlan,
        userId: user.id
      };

      const paymentUrl = await createPaymentRequest(paymentParams);
      
      // 在新窗口中打开支付页面
      window.open(paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      toast({
        title: "支付页面已打开",
        description: "请在新窗口中完成支付，支付成功后会自动开通会员权限",
      });

      setShowPayment(false);
    } catch (error) {
      console.error('创建支付请求失败:', error);
      toast({
        title: "支付失败",
        description: "创建支付请求失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleManualPayment = () => {
    if (!user?.id) {
      toast({
        title: "请先登录",
        description: "需要登录后才能购买会员",
        variant: "destructive"
      });
      return;
    }

    // 保存支付请求到本地存储，供管理员处理
    const existingRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
    const newRequest = {
      id: `${Date.now()}`,
      userId: user.id,
      amount: parseInt(planDetails[selectedPlan].total),
      membershipType: selectedPlan,
      paymentMethod: '支付宝转账',
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };
    
    const updatedRequests = [newRequest, ...existingRequests];
    localStorage.setItem('paymentRequests', JSON.stringify(updatedRequests));
    
    toast({
      title: "支付申请已提交",
      description: "管理员将在24小时内处理您的支付请求",
    });
    
    setShowPayment(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            选择会员套餐
          </h1>
          <p className="text-lg text-gray-300 mb-8">
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
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Annual Plan */}
          <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
            <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-gray-700 hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-5 h-5 text-cyan-400 mr-2" />
                  <h3 className="text-lg font-bold text-white">{planDetails.annual.description}</h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">{planDetails.annual.subtitle}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ¥{planDetails.annual.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">/年</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  平均每月仅需 ¥8.25
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {planDetails.annual.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => handlePurchase('annual')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  立即购买
                </Button>
              </div>
            </div>
          </div>

          {/* Lifetime Plan */}
          <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                <Sparkles className="w-3 h-3 mr-1" />
                推荐
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-purple-400 rounded-3xl p-6 transition-all duration-300 shadow-2xl shadow-purple-500/25">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="text-lg font-bold text-white">{planDetails.lifetime.description}</h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">{planDetails.lifetime.subtitle}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    ¥{planDetails.lifetime.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">/永久</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  相当于4年年费，超值划算
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {planDetails.lifetime.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => handlePurchase('lifetime')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  立即购买
                </Button>
              </div>
            </div>
          </div>

          {/* Agent Plan */}
          <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
            <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-gray-700 hover:border-orange-400/50 rounded-3xl p-6 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-orange-400 mr-2" />
                  <h3 className="text-lg font-bold text-white">{planDetails.agent.description}</h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">{planDetails.agent.subtitle}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    ¥{planDetails.agent.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">/代理</span>
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  推广1单即可回本
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {planDetails.agent.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  onClick={() => handlePurchase('agent')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  立即购买
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 max-w-md w-full relative">
            <button 
              onClick={handleClosePayment}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              disabled={isProcessingPayment}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-4">选择支付方式</h3>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-white mb-1">
                  ¥{planDetails[selectedPlan].total}
                </div>
                <div className="text-gray-400 text-sm">{planDetails[selectedPlan].description}</div>
              </div>

              {/* 支付方式选择 */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'alipay' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">支付宝在线支付</span>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">推荐</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('manual')}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'manual' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">人工审核支付</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={paymentMethod === 'alipay' ? handleAlipayPayment : handleManualPayment}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
              >
                {isProcessingPayment ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </div>
                ) : (
                  paymentMethod === 'alipay' ? '立即支付' : '提交申请'
                )}
              </Button>
              
              {paymentMethod === 'manual' && (
                <p className="text-gray-400 text-xs mt-3">
                  提交后管理员会在24小时内处理您的申请
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
