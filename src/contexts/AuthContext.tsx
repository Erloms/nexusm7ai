
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  isVip: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (feature: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('nexusAi_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('nexusAi_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 管理员账号检查
      if (email === 'Master' && password === 'Mengzhen888') {
        const adminUser: User = {
          id: 'admin_master',
          name: 'Master',
          email: 'master@admin.com',
          isVip: true,
          isAdmin: true
        };
        setUser(adminUser);
        localStorage.setItem('nexusAi_user', JSON.stringify(adminUser));
        toast({
          title: "管理员登录成功",
          description: "欢迎回来，Master！",
        });
        return true;
      }

      // 普通用户登录逻辑
      const users = JSON.parse(localStorage.getItem('nexusAi_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        delete foundUser.password;
        setUser(foundUser);
        localStorage.setItem('nexusAi_user', JSON.stringify(foundUser));
        toast({
          title: "登录成功",
          description: `欢迎回来，${foundUser.name}！`,
        });
        return true;
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "登录失败",
        description: "系统错误，请稍后重试",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('nexusAi_users') || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        toast({
          title: "注册失败",
          description: "该邮箱已被注册",
          variant: "destructive"
        });
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isVip: false,
        isAdmin: false
      };

      users.push(newUser);
      localStorage.setItem('nexusAi_users', JSON.stringify(users));
      
      // Auto login after registration
      const userForLogin = { ...newUser };
      delete userForLogin.password;
      setUser(userForLogin);
      localStorage.setItem('nexusAi_user', JSON.stringify(userForLogin));
      
      toast({
        title: "注册成功",
        description: "欢迎加入NexusAI！",
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "注册失败",
        description: "系统错误，请稍后重试",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexusAi_user');
    toast({
      title: "已退出登录",
      description: "期待您的再次光临！",
    });
  };

  const hasPermission = (feature: string): boolean => {
    if (!user) return false;
    
    // 管理员拥有所有权限
    if (user.isAdmin) return true;
    
    // VIP用户权限
    if (user.isVip) {
      return ['chat', 'image', 'voice', 'video'].includes(feature);
    }
    
    // 免费用户限制
    return false;
  };

  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      hasPermission, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
