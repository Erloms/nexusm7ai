import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Search, UserCheck, UserX, Users, CreditCard, Settings } from 'lucide-react';
import Navigation from "@/components/Navigation";

interface User {
  id: string;
  name: string;
  email: string;
  isPaid: boolean;
  vipExpiry?: string;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  method: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const Admin = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [vipDuration, setVipDuration] = useState('30');

  useEffect(() => {
    loadUsers();
    loadPayments();
  }, []);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('nexusAi_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  };

  const loadPayments = () => {
    const storedPayments = localStorage.getItem('nexusAi_payments');
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    }
  };

  const addManualUser = () => {
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      toast({
        title: "输入错误",
        description: "请填写完整的邮箱和密码",
        variant: "destructive",
      });
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserEmail.split('@')[0],
      email: newUserEmail,
      isPaid: true,
      vipExpiry: new Date(Date.now() + parseInt(vipDuration) * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));

    // 添加支付记录
    const paymentRecord: PaymentRecord = {
      id: Date.now().toString(),
      userId: newUser.id,
      amount: 799,
      method: '管理员手动添加',
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    const updatedPayments = [...payments, paymentRecord];
    setPayments(updatedPayments);
    localStorage.setItem('nexusAi_payments', JSON.stringify(updatedPayments));

    setNewUserEmail('');
    setNewUserPassword('');
    
    toast({
      title: "添加成功",
      description: `用户 ${newUserEmail} 已成功添加并开通VIP`,
    });
  };

  const toggleUserVip = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          isPaid: !user.isPaid,
          vipExpiry: !user.isPaid ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
            undefined
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "操作成功",
      description: "用户VIP状态已更新",
    });
  };

  const deleteUser = (userId: string) => {
    if (!confirm("确定要删除该用户吗？")) return;
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('nexusAi_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "删除成功",
      description: "用户已被删除",
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    vipUsers: users.filter(u => u.isPaid).length,
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    todaySignups: users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">管理员后台</h1>
          <p className="text-gray-400">用户管理与系统监控</p>
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
              <CardTitle className="text-sm font-medium text-white">VIP用户</CardTitle>
              <UserCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.vipUsers}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总收入</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">¥{stats.totalRevenue}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#1a2740] border-[#203042]/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">今日新增</CardTitle>
              <Settings className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.todaySignups}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-[#1a2740] border-[#203042]/60">
            <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600">用户管理</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-cyan-600">支付记录</TabsTrigger>
            <TabsTrigger value="add-user" className="data-[state=active]:bg-cyan-600">添加用户</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">用户列表</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="搜索用户..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-[#14202c] border-[#2e4258] text-white w-64"
                    />
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#203042]/60">
                        <th className="text-left py-3 px-4 text-white font-medium">用户名</th>
                        <th className="text-left py-3 px-4 text-white font-medium">邮箱</th>
                        <th className="text-left py-3 px-4 text-white font-medium">VIP状态</th>
                        <th className="text-left py-3 px-4 text-white font-medium">到期时间</th>
                        <th className="text-left py-3 px-4 text-white font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-[#203042]/30">
                          <td className="py-3 px-4 text-white">{user.name}</td>
                          <td className="py-3 px-4 text-white">{user.email}</td>
                          <td className="py-3 px-4">
                            {user.isPaid ? (
                              <div className="flex items-center gap-2 text-green-400">
                                <UserCheck className="h-4 w-4" />
                                <span>已开通</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-400">
                                <UserX className="h-4 w-4" />
                                <span>未开通</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {user.vipExpiry ? new Date(user.vipExpiry).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={user.isPaid ? "destructive" : "default"}
                                onClick={() => toggleUserVip(user.id)}
                              >
                                {user.isPaid ? '取消VIP' : '开通VIP'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                <CardTitle className="text-white">支付记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#203042]/60">
                        <th className="text-left py-3 px-4 text-white font-medium">订单ID</th>
                        <th className="text-left py-3 px-4 text-white font-medium">用户ID</th>
                        <th className="text-left py-3 px-4 text-white font-medium">金额</th>
                        <th className="text-left py-3 px-4 text-white font-medium">支付方式</th>
                        <th className="text-left py-3 px-4 text-white font-medium">状态</th>
                        <th className="text-left py-3 px-4 text-white font-medium">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-b border-[#203042]/30">
                          <td className="py-3 px-4 text-white">{payment.id.slice(-8)}</td>
                          <td className="py-3 px-4 text-white">{payment.userId.slice(-8)}</td>
                          <td className="py-3 px-4 text-white">¥{payment.amount}</td>
                          <td className="py-3 px-4 text-white">{payment.method}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              payment.status === 'completed' ? 'bg-green-600 text-white' :
                              payment.status === 'pending' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {payment.status === 'completed' ? '已完成' :
                               payment.status === 'pending' ? '待处理' : '失败'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {new Date(payment.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-user" className="space-y-6">
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white">手动添加VIP用户</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    邮箱
                  </label>
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="输入用户邮箱"
                    className="bg-[#14202c] border-[#2e4258] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    密码
                  </label>
                  <Input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="输入用户密码"
                    className="bg-[#14202c] border-[#2e4258] text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    VIP时长（天）
                  </label>
                  <Input
                    type="number"
                    value={vipDuration}
                    onChange={(e) => setVipDuration(e.target.value)}
                    placeholder="输入VIP时长"
                    className="bg-[#14202c] border-[#2e4258] text-white"
                  />
                </div>
                <Button
                  onClick={addManualUser}
                  className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white"
                >
                  添加用户并开通VIP
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;