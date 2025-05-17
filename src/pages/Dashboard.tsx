
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UserDashboard from '@/components/UserDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 如果用户未登录，重定向到登录页面
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow container mx-auto px-4 py-20">
        <div className="card-glowing p-6">
          <UserDashboard />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
