
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

interface PaymentCheckProps {
  children: ReactNode;
  featureType: 'chat' | 'image' | 'voice';
}

const PaymentCheck = ({ children, featureType }: PaymentCheckProps) => {
  const { isAuthenticated, user, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get usage counts from localStorage or initialize them
  const [usageRemaining, setUsageRemaining] = useState(() => {
    if (!isAuthenticated) return 0;
    
    const usageData = localStorage.getItem(`nexusAi_${featureType}_usage_${user?.id}`);
    if (usageData) {
      const { remaining } = JSON.parse(usageData);
      return remaining;
    }
    
    // Default free usage limits - all set to 10
    const defaultLimits = {
      chat: 10,   // 10 free chat interactions 
      image: 10,  // 10 free image generations
      voice: 10   // 10 free voice generations
    };
    
    return defaultLimits[featureType];
  });

  // Initialize usage when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const usageData = localStorage.getItem(`nexusAi_${featureType}_usage_${user.id}`);
      if (!usageData) {
        // Initialize free usage allowance - all set to 10
        const initialRemaining = {
          chat: 10,
          image: 10,
          voice: 10
        };
        
        localStorage.setItem(`nexusAi_${featureType}_usage_${user.id}`, JSON.stringify({
          remaining: initialRemaining[featureType as keyof typeof initialRemaining]
        }));
        
        setUsageRemaining(initialRemaining[featureType as keyof typeof initialRemaining]);
      }
    }
  }, [isAuthenticated, user?.id, featureType]);

  // Function to be called when a feature is used
  const decrementUsage = () => {
    if (isAuthenticated && user?.id && !checkPaymentStatus()) {
      const newRemaining = usageRemaining - 1;
      localStorage.setItem(`nexusAi_${featureType}_usage_${user.id}`, JSON.stringify({
        remaining: newRemaining
      }));
      setUsageRemaining(newRemaining);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <div className="card-glowing p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">需要登录</h2>
          <p className="text-white/80 mb-6">您需要登录后才能使用此功能</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
            >
              登录账号
            </Button>
            
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-dark/50"
            >
              免费注册
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!checkPaymentStatus() && usageRemaining <= 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <div className="card-glowing p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">免费体验次数已用完</h2>
          <p className="text-white/80 mb-6">
            您已用完免费体验次数
          </p>
          <p className="text-lg text-gradient-gold font-bold mb-6">
            只需 ¥299 即可永久使用所有功能！
          </p>
          <Button 
            onClick={() => navigate('/payment')}
            className="bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
          >
            立即升级
          </Button>
        </div>
      </div>
    );
  }

  // For non-paying users, render children but wrap them to track usage
  if (!checkPaymentStatus()) {
    // Clone children and add usage tracking
    return (
      <div className="w-full h-full">
        <div className="bg-nexus-blue/20 text-white text-center py-2 px-4 mb-4 rounded-md">
          <p>您正在使用免费体验，还剩 <span className="font-bold text-nexus-cyan">{usageRemaining}</span> 次
            {featureType === 'chat' ? '对话' : featureType === 'image' ? '图像生成' : '语音合成'}机会
          </p>
        </div>
        {React.cloneElement(children as React.ReactElement, { decrementUsage })}
      </div>
    );
  }

  // For paying users, just render children
  return <>{children}</>;
};

export default PaymentCheck;
