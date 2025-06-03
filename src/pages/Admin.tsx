
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PaymentRequests from '@/components/PaymentRequests';
import UserManagement from '@/components/UserManagement';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { User, CreditCard, Settings, Users, BarChart3, Wallet } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
}

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users from localStorage
    const loadUsers = () => {
      const savedUsers = localStorage.getItem('nexusAi_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }
    };
    
    loadUsers();
  }, []);

  // 处理管理员登录
  const handleAdminLogin = () => {
    setIsLoggingIn(true);
    
    setTimeout(() => {
      if (username === 'Master' && password === 'Mengzhen888') {
        setIsAdmin(true);
        toast({
          title: "管理员登录成功",
          description: "欢迎回来，管理员",
        });
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive",
        });
      }
      setIsLoggingIn(false);
    }, 1000);
  };

  // 如果用户不是管理员，显示登录页面
  if (!isAdmin && user?.name !== '管理员') {
    return (
      <div className="min-h-screen bg-nexus-dark flex flex-col">
        <Navigation />
        
        <div className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md">
            <div className="card-glowing p-8">
              <h1 className="text-3xl font-bold text-center mb-8 text-gradient">管理员登录</h1>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                    用户名
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    placeholder="请输入管理员用户名"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    密码
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                    placeholder="请输入管理员密码"
                    required
                  />
                </div>
                
                <Button
                  onClick={handleAdminLogin}
                  className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? '登录中...' : '登录'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // 管理员面板
  return (
    <div className="min-h-screen bg-nexus-dark flex flex-col">
      <Navigation />
      
      <div className="flex-grow container mx-auto py-20 px-4">
        <SidebarProvider>
          <div className="flex w-full min-h-[600px] bg-nexus-dark/80 border border-nexus-blue/30 rounded-lg overflow-hidden">
            <Sidebar className="w-64 border-r border-nexus-blue/30 bg-nexus-dark/50">
              <SidebarHeader className="p-4 border-b border-nexus-blue/30">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-nexus-cyan" />
                  <span className="text-lg font-medium text-white">管理员控制台</span>
                </div>
              </SidebarHeader>
              
              <SidebarContent>
                <SidebarGroup>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-white/70 mb-3">管理功能</h3>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={activeTab === 'dashboard' ? "bg-nexus-blue/20" : ""}
                          onClick={() => setActiveTab('dashboard')}
                        >
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-nexus-cyan" />
                            <span>仪表板</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={activeTab === 'users' ? "bg-nexus-blue/20" : ""}
                          onClick={() => setActiveTab('users')}
                        >
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-nexus-cyan" />
                            <span>用户管理</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={activeTab === 'payments' ? "bg-nexus-blue/20" : ""}
                          onClick={() => setActiveTab('payments')}
                        >
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-nexus-cyan" />
                            <span>支付管理</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={activeTab === 'commission' ? "bg-nexus-blue/20" : ""}
                          onClick={() => setActiveTab('commission')}
                        >
                          <div className="flex items-center space-x-2">
                            <Wallet className="h-4 w-4 text-nexus-cyan" />
                            <span>代理分成</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          className={activeTab === 'settings' ? "bg-nexus-blue/20" : ""}
                          onClick={() => setActiveTab('settings')}
                        >
                          <div className="flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-nexus-cyan" />
                            <span>系统设置</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </div>
                </SidebarGroup>
              </SidebarContent>
              
              <SidebarFooter className="p-4 border-t border-nexus-blue/30 text-xs text-white/50">
                管理员版本 v1.0
              </SidebarFooter>
            </Sidebar>
            
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gradient">管理员控制面板</h1>
                <p className="text-white/70">系统管理与运营控制</p>
              </div>
              
              <div className="space-y-6">
                {activeTab === 'dashboard' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">系统概览</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-4">
                        <div className="text-nexus-cyan text-sm mb-1">总用户数</div>
                        <div className="text-2xl font-bold text-white">{users.length}</div>
                      </div>
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-4">
                        <div className="text-nexus-cyan text-sm mb-1">VIP会员</div>
                        <div className="text-2xl font-bold text-white">{users.filter(u => u.isPaid).length}</div>
                      </div>
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-4">
                        <div className="text-nexus-cyan text-sm mb-1">待处理支付</div>
                        <div className="text-2xl font-bold text-white">3</div>
                      </div>
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-4">
                        <div className="text-nexus-cyan text-sm mb-1">代理收益</div>
                        <div className="text-2xl font-bold text-white">¥1,280</div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'users' && <UserManagement users={users} setUsers={setUsers} />}
                {activeTab === 'payments' && <PaymentRequests />}
                {activeTab === 'commission' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">代理分成管理</h2>
                    <div className="space-y-4">
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-nexus-cyan mb-4">代理分成配置</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">分成比例</label>
                            <Input value="30%" className="bg-nexus-dark/50 border-nexus-blue/30 text-white" readOnly />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">最低提现金额</label>
                            <Input value="100" className="bg-nexus-dark/50 border-nexus-blue/30 text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-nexus-cyan mb-4">代理收益统计</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-nexus-blue/30">
                                <th className="text-left py-2 text-white">代理用户</th>
                                <th className="text-left py-2 text-white">推荐人数</th>
                                <th className="text-left py-2 text-white">累计收益</th>
                                <th className="text-left py-2 text-white">可提现</th>
                                <th className="text-left py-2 text-white">状态</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-nexus-blue/30">
                                <td className="py-2 text-white">user123@example.com</td>
                                <td className="py-2 text-white">5</td>
                                <td className="py-2 text-white">¥450</td>
                                <td className="py-2 text-white">¥450</td>
                                <td className="py-2 text-green-500">活跃</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">支付宝配置</h2>
                    <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">APP ID</label>
                          <Input 
                            placeholder="请输入支付宝APP ID" 
                            className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">应用私钥</label>
                          <Input 
                            type="password"
                            placeholder="请输入应用私钥" 
                            className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">支付宝公钥</label>
                          <Input 
                            type="password"
                            placeholder="请输入支付宝公钥" 
                            className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">回调地址</label>
                          <Input 
                            placeholder="https://your-domain.com/api/alipay/notify" 
                            className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                          />
                        </div>
                        <Button className="bg-nexus-blue hover:bg-nexus-blue/80 text-white">
                          保存配置
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;
