
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";

interface PaymentCheckProps {
  children: ReactNode;
  featureType: 'chat' | 'image';
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
    return featureType === 'chat' ? 5 : 10; // Default: 5 for chat, 10 for image
  });

  // Initialize usage when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const usageData = localStorage.getItem(`nexusAi_${featureType}_usage_${user.id}`);
      if (!usageData) {
        // Initialize free usage allowance
        const initialRemaining = featureType === 'chat' ? 5 : 10;
        localStorage.setItem(`nexusAi_${featureType}_usage_${user.id}`, JSON.stringify({
          remaining: initialRemaining
        }));
        setUsageRemaining(initialRemaining);
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
          <Button 
            onClick={() => navigate('/login')}
            className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
          >
            立即登录
          </Button>
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
            （{featureType === 'chat' ? '5次对话' : '10次图像生成'}）
          </p>
          <p className="text-lg text-gradient-gold font-bold mb-6">
            只需 ¥99 即可永久使用所有功能！
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
          <p>您正在使用免费体验，还剩 <span className="font-bold text-nexus-cyan">{usageRemaining}</span> 次{featureType === 'chat' ? '对话' : '图像生成'}机会</p>
        </div>
        {React.cloneElement(children as React.ReactElement, { decrementUsage })}
      </div>
    );
  }

  // For paying users, just render children
  return <>{children}</>;
};

export default PaymentCheck;
