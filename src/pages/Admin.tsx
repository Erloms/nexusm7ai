
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CreditCard, Settings, UserCheck, UserPlus } from 'lucide-react';
import Navigation from "@/components/Navigation";

interface User {
  id: string;
  email: string;
  name: string;
  membershipType: 'free' | 'annual' | 'lifetime';
  membershipExpiry?: string;
  joinDate: string;
}

interface PaymentOrder {
  id: string;
  userId: string;
  email: string;
  amount: number;
  plan: 'annual' | 'lifetime';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  paymentMethod: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Manual activation form
  const [activationEmail, setActivationEmail] = useState('');
  const [activationPlan, setActivationPlan] = useState<'annual' | 'lifetime'>('annual');

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('nexusAi_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Add some mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@example.com',
          name: '用户一',
          membershipType: 'free',
          joinDate: '2024-01-15'
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: '用户二',
          membershipType: 'annual',
          membershipExpiry: '2025-01-15',
          joinDate: '2024-01-20'
        }
      ];
      setUsers(mockUsers);
      localStorage.setItem('nexusAi_users', JSON.stringify(mockUsers));
    }

    // Load payment orders
    const savedOrders = localStorage.getItem('nexusAi_payment_orders');
    if (savedOrders) {
      setPaymentOrders(JSON.parse(savedOrders));
    } else {
      // Add some mock payment data
      const mockOrders: PaymentOrder[] = [
        {
          id: '1',
          userId: '3',
          email: 'newuser@example.com',
          amount: 99,
          plan: 'annual',
          status: 'pending',
          timestamp: new Date().toISOString(),
          paymentMethod: 'alipay'
        }
      ];
      setPaymentOrders(mockOrders);
      localStorage.setItem('nexusAi_payment_orders', JSON.stringify(mockOrders));
    }
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualActivation = () => {
    if (!activationEmail) {
      toast({
        title: "错误",
        description: "请输入用户邮箱",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.map(user => {
      if (user.email === activationEmail) {
        const expiryDate = activationPlan === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;
        
        return {
          ...user,
          membershipType: activationPlan,
          membershipExpiry: expiryDate
        };
      }
      return user;
    });

    // If user doesn't exist, create new one
    if (!users.find(u => u.email === activationEmail)) {
      const newUser: User = {
        id: Date.now().toString(),
        email: activationEmail,
        name: activationEmail.split('@')[0],
        membershipType: activationPlan,
        membershipExpiry: activationPlan === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        joinDate: new Date().toISOString()
      };
      updatedUsers.push(newUser);
    }

    setUsers(updatedUsers);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));
    setActivationEmail('');
    
    toast({
      title: "成功",
      description: `已为 ${activationEmail} 开通${activationPlan === 'annual' ? '年' : '永久'}会员`,
    });
  };

  const approvePayment = (orderId: string) => {
    const order = paymentOrders.find(o => o.id === orderId);
    if (!order) return;

    // Update order status
    const updatedOrders = paymentOrders.map(o => 
      o.id === orderId ? { ...o, status: 'completed' as const } : o
    );
    setPaymentOrders(updatedOrders);
    localStorage.setItem('nexusAi_payment_orders', JSON.stringify(updatedOrders));

    // Update user membership
    const updatedUsers = users.map(user => {
      if (user.email === order.email) {
        const expiryDate = order.plan === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined;
        
        return {
          ...user,
          membershipType: order.plan,
          membershipExpiry: expiryDate
        };
      }
      return user;
    });

    // If user doesn't exist, create new one
    if (!users.find(u => u.email === order.email)) {
      const newUser: User = {
        id: Date.now().toString(),
        email: order.email,
        name: order.email.split('@')[0],
        membershipType: order.plan,
        membershipExpiry: order.plan === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        joinDate: new Date().toISOString()
      };
      updatedUsers.push(newUser);
    }

    setUsers(updatedUsers);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));

    toast({
      title: "支付已确认",
      description: `已为 ${order.email} 开通会员权限`,
    });
  };

  const stats = {
    totalUsers: users.length,
    paidUsers: users.filter(u => u.membershipType !== 'free').length,
    pendingPayments: paymentOrders.filter(o => o.status === 'pending').length,
    totalRevenue: paymentOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">管理员后台</h1>
          <p className="text-gray-400">用户管理、支付处理与系统配置</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总用户数</CardTitle>
              <Users className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">付费用户</CardTitle>
              <UserCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.paidUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">待处理支付</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总收入</CardTitle>
              <Settings className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">¥{stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#1a2740] border-[#203042]/60">
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600">用户管理</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-600">支付管理</TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-cyan-600">手动开通</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  用户列表
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="搜索用户..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#14202c] border-[#2e4258] text-white max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#203042]/60">
                        <th className="text-left py-3 px-4 text-white font-medium">邮箱</th>
                        <th className="text-left py-3 px-4 text-white font-medium">姓名</th>
                        <th className="text-left py-3 px-4 text-white font-medium">会员类型</th>
                        <th className="text-left py-3 px-4 text-white font-medium">到期时间</th>
                        <th className="text-left py-3 px-4 text-white font-medium">加入时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-[#203042]/30">
                          <td className="py-3 px-4 text-white">{user.email}</td>
                          <td className="py-3 px-4 text-white">{user.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.membershipType === 'lifetime' ? 'bg-purple-600 text-white' :
                              user.membershipType === 'annual' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {user.membershipType === 'lifetime' ? '永久会员' :
                               user.membershipType === 'annual' ? '年会员' : '免费用户'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {user.membershipExpiry 
                              ? new Date(user.membershipExpiry).toLocaleDateString()
                              : user.membershipType === 'lifetime' ? '永久' : '-'
                            }
                          </td>
                          <td className="py-3 px-4 text-white">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white">支付订单管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#203042]/60">
                        <th className="text-left py-3 px-4 text-white font-medium">用户邮箱</th>
                        <th className="text-left py-3 px-4 text-white font-medium">套餐</th>
                        <th className="text-left py-3 px-4 text-white font-medium">金额</th>
                        <th className="text-left py-3 px-4 text-white font-medium">支付方式</th>
                        <th className="text-left py-3 px-4 text-white font-medium">状态</th>
                        <th className="text-left py-3 px-4 text-white font-medium">时间</th>
                        <th className="text-left py-3 px-4 text-white font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentOrders.map(order => (
                        <tr key={order.id} className="border-b border-[#203042]/30">
                          <td className="py-3 px-4 text-white">{order.email}</td>
                          <td className="py-3 px-4 text-white">
                            {order.plan === 'annual' ? '年会员' : '永久会员'}
                          </td>
                          <td className="py-3 px-4 text-white">¥{order.amount}</td>
                          <td className="py-3 px-4 text-white">{order.paymentMethod}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'completed' ? 'bg-green-600 text-white' :
                              order.status === 'pending' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {order.status === 'completed' ? '已完成' :
                               order.status === 'pending' ? '待处理' : '失败'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => approvePayment(order.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                确认支付
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  手动开通会员
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="activationEmail" className="text-white">用户邮箱</Label>
                      <Input
                        id="activationEmail"
                        type="email"
                        value={activationEmail}
                        onChange={(e) => setActivationEmail(e.target.value)}
                        placeholder="输入用户邮箱地址"
                        className="bg-[#14202c] border-[#2e4258] text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="activationPlan" className="text-white">会员类型</Label>
                      <Select value={activationPlan} onValueChange={(value: 'annual' | 'lifetime') => setActivationPlan(value)}>
                        <SelectTrigger className="bg-[#14202c] border-[#2e4258] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">年会员 (¥99)</SelectItem>
                          <SelectItem value="lifetime">永久会员 (¥399)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Button 
                      onClick={handleManualActivation}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      立即开通
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-[#203042]/60 pt-4">
                  <p className="text-gray-400 text-sm">
                    提示：如果用户不存在，系统将自动创建新用户并开通对应会员权限。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
