
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
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

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

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation for demo purposes
      if (email && password.length >= 6) {
        const mockUser = {
          id: '123456',
          email: email,
          name: email.split('@')[0],
          isVip: false
        };
        
        setUser(mockUser);
        localStorage.setItem('nexusAiUser', JSON.stringify(mockUser));
        
        toast({
          title: "登录成功",
          description: "欢迎回来！",
          duration: 3000,
        });
        
        return true;
      } else {
        toast({
          title: "登录失败",
          description: "邮箱或密码不正确",
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

  // Mock register function
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
        
        toast({
          title: "注册成功",
          description: "欢迎加入 Nexus AI！",
          duration: 3000,
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
      duration: 3000,
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout
    }}>
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
