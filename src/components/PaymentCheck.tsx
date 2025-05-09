
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

interface PaymentCheckProps {
  children: ReactNode;
}

const PaymentCheck = ({ children }: PaymentCheckProps) => {
  const { isAuthenticated, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();

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

  if (!checkPaymentStatus()) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <div className="card-glowing p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">会员专享功能</h2>
          <p className="text-white/80 mb-6">此功能仅限会员使用</p>
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

  return <>{children}</>;
};

export default PaymentCheck;
