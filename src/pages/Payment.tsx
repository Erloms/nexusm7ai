
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Star, Zap, Users } from 'lucide-react';
import { createPaymentRequest } from '@/utils/paymentService';

const Payment = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'annual',
      name: '年度会员',
      price: 99,
      originalPrice: 199,
      duration: '12个月',
      color: 'from-blue-500 to-cyan-500',
      icon: <Star className="h-8 w-8 text-white" />,
      features: [
        '访问15个顶级AI模型',
        '无限制AI对话',
        'AI绘画功能',
        '文本转语音',
        '优先客服支持',
        '专属会员标识'
      ]
    },
    {
      id: 'lifetime',
      name: '永久会员',
      price: 399,
      originalPrice: 999,
      duration: '永久',
      color: 'from-purple-500 to-pink-500',
      icon: <Crown className="h-8 w-8 text-white" />,
      badge: '最受欢迎',
      features: [
        '访问15个顶级AI模型',
        '永久免费使用所有AI功能',
        '专属VIP身份标识',
        '无限制访问新功能',
        '优先体验新模型',
        '专属客服通道'
      ]
    },
    {
      id: 'agent',
      name: '代理商套餐',
      price: 1999,
      originalPrice: 3999,
      duration: '永久',
      color: 'from-orange-500 to-red-500',
      icon: <Users className="h-8 w-8 text-white" />,
      badge: '推广赚钱',
      features: [
        '永久免费使用所有AI功能',
        '专属VIP身份标识',
        '无限制访问新功能',
        '30%推广收益分成',
        '专属代理商后台(开发中)',
        '专属客服支持'
      ]
    }
  ];

  const handlePayment = async (planId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "请先登录",
        description: "登录后即可购买会员套餐",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('套餐不存在');

      const paymentParams = {
        amount: plan.price.toString(),
        planName: plan.name,
        planType: planId as 'annual' | 'lifetime' | 'agent',
        userId: user.id
      };

      // 创建支付请求
      const paymentUrl = await createPaymentRequest(paymentParams);

      // 跳转到支付页面
      window.location.href = paymentUrl;

    } catch (error) {
      console.error('支付失败:', error);
      toast({
        title: "支付失败",
        description: error instanceof Error ? error.message : "支付处理出错，请重试",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      <div className="pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              选择您的会员套餐
            </h1>
            <p className="text-gray-300 text-xl">
              解锁全部AI功能，享受无限创作体验
            </p>
          </div>

          {/* 套餐卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative overflow-hidden border-2 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                  plan.badge ? 'border-purple-500' : 'border-gray-700 hover:border-cyan-500'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-purple-500 text-white px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {plan.duration}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-white">¥{plan.price}</span>
                      <span className="text-gray-400 line-through">¥{plan.originalPrice}</span>
                    </div>
                    <div className="text-sm text-green-400">
                      立省 ¥{plan.originalPrice - plan.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePayment(plan.id)}
                    disabled={isProcessing}
                    className={`w-full py-3 text-white font-medium rounded-xl transition-all ${
                      selectedPlan === plan.id
                        ? 'opacity-75 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:shadow-lg hover:shadow-cyan-500/25`
                    }`}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        处理中...
                      </div>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        立即购买
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 支付说明 */}
          <div className="text-center text-gray-400 space-y-2">
            <p>💳 支持支付宝、微信支付、QQ钱包等多种支付方式</p>
            <p>🔒 采用SSL加密，保障支付安全</p>
            <p>📞 如有问题，请联系客服获取帮助</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
