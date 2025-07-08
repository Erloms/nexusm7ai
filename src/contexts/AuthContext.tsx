
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  isVip: boolean;
  membershipType: 'free' | 'annual' | 'lifetime';
  membershipExpiresAt?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPaymentStatus: () => boolean;
  setUserAsPaid: (membershipType: 'annual' | 'lifetime') => void;
  hasPermission: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('nexusAiUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Check if annual membership has expired
        if (parsedUser.membershipType === 'annual' && parsedUser.membershipExpiresAt) {
          const expirationDate = new Date(parsedUser.membershipExpiresAt);
          const now = new Date();
          if (now > expirationDate) {
            parsedUser.membershipType = 'free';
            parsedUser.isVip = false;
            parsedUser.membershipExpiresAt = null;
            localStorage.setItem('nexusAiUser', JSON.stringify(parsedUser));
          }
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem('nexusAiUser');
      }
    }
    
    setLoading(false);
  }, []);

  const checkPaymentStatus = (): boolean => {
    if (!user) return false;
    return user.isVip === true;
  };

  const setUserAsPaid = (membershipType: 'annual' | 'lifetime') => {
    if (user) {
      const updatedUser = { 
        ...user, 
        isVip: true, 
        membershipType,
        membershipExpiresAt: membershipType === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null
      };
      setUser(updatedUser);
      localStorage.setItem('nexusAiUser', JSON.stringify(updatedUser));
      
      toast({
        title: "支付成功",
        description: `感谢您的支付！您已成为${membershipType === 'annual' ? '年' : '永久'}会员。`,
        duration: 5000,
      });
    }
  };

  const hasPermission = (feature: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.isVip;
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (emailOrUsername && password.length >= 6) {
        const isAdmin = emailOrUsername === 'admin' || emailOrUsername === 'admin@nexus.ai';
        
        const mockUser: User = {
          id: '123456',
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          name: isAdmin ? 'Admin' : (emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername),
          isVip: isAdmin,
          membershipType: isAdmin ? 'lifetime' : 'free',
          role: isAdmin ? 'admin' : 'user'
        };
        
        setUser(mockUser);
        localStorage.setItem('nexusAiUser', JSON.stringify(mockUser));
        
        toast({
          title: "登录成功",
          description: `欢迎${isAdmin ? '管理员' : ''}回来！`,
          duration: 3000,
        });
        
        return true;
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码不正确",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "登录失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (name && email && password.length >= 6) {
        const mockUser: User = {
          id: Date.now().toString(),
          email: email,
          name: name,
          isVip: false,
          membershipType: 'free',
          role: 'user'
        };
        
        setUser(mockUser);
        localStorage.setItem('nexusAiUser', JSON.stringify(mockUser));
        
        toast({
          title: "注册成功",
          description: "欢迎加入 Nexus AI！",
          duration: 5000,
        });
        
        return true;
      } else {
        toast({
          title: "注册失败",
          description: "请提供有效的信息",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      toast({
        title: "注册失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexusAiUser');
    toast({
      title: "已退出登录",
      description: "您已成功退出登录",
      duration: 3000,
    });
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    checkPaymentStatus,
    setUserAsPaid,
    hasPermission
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
