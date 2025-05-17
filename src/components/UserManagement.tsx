
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Check, X, ChevronUp, ChevronDown, Search, Phone, Mail } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  isVip: boolean;
  registrationDate: string;
  contactType?: 'email' | 'phone';
}

interface PaymentRequest {
  id: string;
  contactInfo: string;
  orderNumber: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'rejected';
  userId: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('all');

  // 模拟从后端加载用户数据
  useEffect(() => {
    // 在实际应用中，这里应该从API加载数据
    const mockUsers: User[] = [
      { 
        id: '1', 
        name: '13800138000', 
        email: '13800138000',
        isVip: true,
        registrationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        contactType: 'phone'
      },
      { 
        id: '2', 
        name: 'user123@example.com', 
        email: 'user123@example.com',
        isVip: false,
        registrationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        contactType: 'email'
      },
      { 
        id: '3', 
        name: '13900139000', 
        email: '13900139000',
        isVip: false,
        registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        contactType: 'phone'
      },
      // 加载本地存储的用户
      ...JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    ];
    
    // 加载支付请求
    const storedPaymentRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
    setPaymentRequests(storedPaymentRequests);
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  // 处理用户VIP状态变更
  const handleVipStatusChange = (id: string, makeVip: boolean) => {
    setUsers(prev => {
      const updated = prev.map(user => 
        user.id === id 
          ? { ...user, isVip: makeVip } 
          : user
      );
      
      // 保存到本地存储（在实际应用中，还应该调用API更新）
      localStorage.setItem('registeredUsers', JSON.stringify(
        updated.filter(user => !['1', '2', '3'].includes(user.id))
      ));
      
      // 更新登录用户的VIP状态
      const loggedInUser = JSON.parse(localStorage.getItem('nexusAiUser') || '{}');
      if (loggedInUser.id === id) {
        loggedInUser.isVip = makeVip;
        localStorage.setItem('nexusAiUser', JSON.stringify(loggedInUser));
      }
      
      return updated;
    });

    // 显示操作成功通知
    toast({
      title: makeVip ? "VIP权限已开通" : "VIP权限已取消",
      description: `已${makeVip ? '开通' : '取消'}用户 ${users.find(u => u.id === id)?.name} 的VIP权限`,
    });
  };

  // 处理支付请求审批
  const handlePaymentRequestApproval = (requestId: string, approve: boolean) => {
    // 查找请求
    const request = paymentRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // 更新请求状态
    const updatedRequests = paymentRequests.map(req => 
      req.id === requestId 
        ? { ...req, status: approve ? 'completed' : 'rejected' } 
        : req
    );
    
    setPaymentRequests(updatedRequests);
    localStorage.setItem('paymentRequests', JSON.stringify(updatedRequests));
    
    // 如果批准，为用户开通VIP
    if (approve) {
      // 查找相关用户
      const user = users.find(u => u.id === request.userId);
      if (user) {
        handleVipStatusChange(user.id, true);
      }
      
      toast({
        title: "支付已确认",
        description: `已确认支付并为用户开通VIP权限`,
      });
    } else {
      toast({
        title: "支付已拒绝",
        description: `已拒绝支付请求`,
        variant: "destructive",
      });
    }
  };

  // 排序功能
  const toggleSort = (column: 'name' | 'date') => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // 判断是否是邮箱
  const isEmail = (text: string): boolean => {
    return /\S+@\S+\.\S+/.test(text);
  };

  // 过滤和排序用户
  const filteredAndSortedUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc' 
          ? new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
          : new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      }
    });

  // 按VIP状态过滤用户
  const vipUsers = filteredAndSortedUsers.filter(user => user.isVip);
  const regularUsers = filteredAndSortedUsers.filter(user => !user.isVip);
  
  // 过滤挂起的支付请求
  const pendingPaymentRequests = paymentRequests.filter(req => req.status === 'pending');

  const renderUserTable = (usersList: User[]) => (
    <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white cursor-pointer" onClick={() => toggleSort('name')}>
              <div className="flex items-center">
                账号信息
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-white cursor-pointer" onClick={() => toggleSort('date')}>
              <div className="flex items-center">
                注册时间
                {sortBy === 'date' && (
                  sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead className="text-white">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersList.length > 0 ? (
            usersList.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-white">
                  <div className="flex items-center">
                    {isEmail(user.name) ? 
                      <Mail className="w-4 h-4 mr-2 text-nexus-cyan" /> : 
                      <Phone className="w-4 h-4 mr-2 text-nexus-blue" />
                    }
                    <span>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  {new Date(user.registrationDate).toLocaleString()}
                </TableCell>
                <TableCell>
                  {user.isVip ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                        VIP会员
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleVipStatusChange(user.id, false)}
                      >
                        <X className="w-4 h-4 mr-1" /> 取消VIP
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVipStatusChange(user.id, true)}
                    >
                      <Check className="w-4 h-4 mr-1" /> 开通VIP
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-white/70 py-6">
                没有找到用户
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderPaymentRequests = () => (
    <div className="bg-nexus-dark/50 border border-nexus-blue/30 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">订单号</TableHead>
            <TableHead className="text-white">联系方式</TableHead>
            <TableHead className="text-white">提交时间</TableHead>
            <TableHead className="text-white">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingPaymentRequests.length > 0 ? (
            pendingPaymentRequests.map(request => (
              <TableRow key={request.id}>
                <TableCell className="font-medium text-white">
                  {request.orderNumber}
                </TableCell>
                <TableCell className="text-white">
                  {request.contactInfo}
                </TableCell>
                <TableCell className="text-white">
                  {new Date(request.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handlePaymentRequestApproval(request.id, true)}
                    >
                      <Check className="w-4 h-4 mr-1" /> 确认支付
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handlePaymentRequestApproval(request.id, false)}
                    >
                      <X className="w-4 h-4 mr-1" /> 拒绝
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-white/70 py-6">
                没有待处理的支付请求
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return <div className="p-8 text-center text-white">正在加载用户数据...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">用户管理</h2>
          <p className="text-white/70">管理系统用户、处理支付请求、分配VIP权限</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
          <Input
            placeholder="搜索账号"
            className="pl-10 bg-nexus-dark/50 border-nexus-blue/30 text-white w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-nexus-dark/50 border border-nexus-blue/30 mb-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-nexus-blue text-white">
            全部用户 ({filteredAndSortedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="vip" className="data-[state=active]:bg-nexus-blue text-white">
            VIP会员 ({vipUsers.length})
          </TabsTrigger>
          <TabsTrigger value="regular" className="data-[state=active]:bg-nexus-blue text-white">
            普通用户 ({regularUsers.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-nexus-blue text-white">
            支付请求 ({pendingPaymentRequests.length})
          </TabsTrigger>
        </TabsList>
            
        <TabsContent value="all" className="mt-6">
          {renderUserTable(filteredAndSortedUsers)}
        </TabsContent>
        
        <TabsContent value="vip" className="mt-6">
          {renderUserTable(vipUsers)}
        </TabsContent>
        
        <TabsContent value="regular" className="mt-6">
          {renderUserTable(regularUsers)}
        </TabsContent>
        
        <TabsContent value="payments" className="mt-6">
          {renderPaymentRequests()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
