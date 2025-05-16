import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  isVip: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPaymentStatus: () => boolean;
  setUserAsPaid: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('nexusAiUser');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user data", e);
        localStorage.removeItem('nexusAiUser');
      }
    }
    
    setLoading(false);
  }, []);

  // Function to check if user has paid
  const checkPaymentStatus = (): boolean => {
    if (!user) return false;
    return user.isVip === true;
  };

  // Function to set user as paid after payment
  const setUserAsPaid = () => {
    if (user) {
      const updatedUser = { ...user, isVip: true };
      setUser(updatedUser);
      localStorage.setItem('nexusAiUser', JSON.stringify(updatedUser));
      
      toast({
        title: "支付成功",
        description: "感谢您的支付！您已成为VIP会员。",
        duration: 5000,
      });
    }
  };

  // Login function - accepts either email or username
  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo purposes
      if (emailOrUsername && password.length >= 6) {
        const mockUser = {
          id: '123456',
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@example.com`,
          name: emailOrUsername.includes('@') ? emailOrUsername.split('@')[0] : emailOrUsername,
          isVip: false
        };
        
        setUser(mockUser);
        localStorage.setItem('nexusAiUser', JSON.stringify(mockUser));
        
        // Initialize usage counts for new user
        localStorage.setItem(`nexusAi_chat_usage_${mockUser.id}`, JSON.stringify({ remaining: 5 }));
        localStorage.setItem(`nexusAi_image_usage_${mockUser.id}`, JSON.stringify({ remaining: 10 }));
        localStorage.setItem(`nexusAi_voice_usage_${mockUser.id}`, JSON.stringify({ remaining: 10 }));
        
        toast({
          title: "登录成功",
          description: "欢迎回来！",
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

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo
      if (name && email && password.length >= 6) {
        const mockUser = {
          id: '123456',
          email: email,
          name: name,
          isVip: false
        };
        
        setUser(mockUser);
        localStorage.setItem('nexusAiUser', JSON.stringify(mockUser));
        
        // Initialize usage counts for new user
        localStorage.setItem(`nexusAi_chat_usage_${mockUser.id}`, JSON.stringify({ remaining: 5 }));
        localStorage.setItem(`nexusAi_image_usage_${mockUser.id}`, JSON.stringify({ remaining: 10 }));
        localStorage.setItem(`nexusAi_voice_usage_${mockUser.id}`, JSON.stringify({ remaining: 10 }));
        
        toast({
          title: "注册成功",
          description: "欢迎加入 Nexus AI！您有5次AI对话、10次图像生成、10次语音合成的免费体验额度。",
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
    setUserAsPaid
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Updated useAuth hook with better error handling
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
