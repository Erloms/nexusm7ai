
import CryptoJS from 'crypto-js';

const PAYMENT_CONFIG = {
  PID: '170343392',
  KEY: 'P2Z1q3PDtQptzkt38qp8ZZQ0XS1N1bNq',
  API_URL: 'https://zf.yk520.top',
  NOTIFY_URL: 'https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/alipay-notify',
  RETURN_URL: 'https://nexus.m7ai.top/payment-success'
};

export interface PaymentParams {
  amount: string;
  planName: string;
  planType: 'annual' | 'lifetime' | 'agent';
  userId: string;
}

// 生成MD5签名
function generateMD5Sign(params: Record<string, string>): string {
  // 按照API文档要求的顺序构建签名字符串
  const signString = `money=${params.money}&name=${params.name}&notify_url=${params.notify_url}&out_trade_no=${params.out_trade_no}&pid=${params.pid}&return_url=${params.return_url}&sitename=${params.sitename}&type=${params.type}${PAYMENT_CONFIG.KEY}`;
  
  console.log('Sign string:', signString);
  return CryptoJS.MD5(signString).toString();
}

// 生成订单号
function generateOrderNo(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORDER${timestamp}${random}`;
}

// 创建支付请求
export async function createPaymentRequest(params: PaymentParams): Promise<string> {
  const orderNo = generateOrderNo();
  
  const paymentParams = {
    pid: PAYMENT_CONFIG.PID,
    type: 'alipay', // 支付宝
    out_trade_no: orderNo,
    notify_url: PAYMENT_CONFIG.NOTIFY_URL,
    return_url: PAYMENT_CONFIG.RETURN_URL,
    name: params.planName,
    money: params.amount,
    sitename: 'NexusAI会员中心'
  };

  // 生成签名
  const sign = generateMD5Sign(paymentParams);
  
  // 构建支付URL
  const paymentUrl = new URL(`${PAYMENT_CONFIG.API_URL}/submit.php`);
  Object.entries(paymentParams).forEach(([key, value]) => {
    paymentUrl.searchParams.append(key, value);
  });
  paymentUrl.searchParams.append('sign', sign);
  paymentUrl.searchParams.append('sign_type', 'MD5');

  console.log('Payment URL:', paymentUrl.toString());

  // 保存订单信息到localStorage
  const orderInfo = {
    orderId: orderNo,
    userId: params.userId,
    amount: params.amount,
    planType: params.planType,
    planName: params.planName,
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  const existingOrders = JSON.parse(localStorage.getItem('nexusAi_orders') || '[]');
  existingOrders.push(orderInfo);
  localStorage.setItem('nexusAi_orders', JSON.stringify(existingOrders));

  return paymentUrl.toString();
}

// 查询订单状态
export async function queryOrderStatus(outTradeNo: string): Promise<any> {
  try {
    const queryUrl = `${PAYMENT_CONFIG.API_URL}/api.php?act=order&pid=${PAYMENT_CONFIG.PID}&key=${PAYMENT_CONFIG.KEY}&out_trade_no=${outTradeNo}`;
    
    const response = await fetch(queryUrl);
    const result = await response.json();
    
    console.log('Order query result:', result);
    return result;
  } catch (error) {
    console.error('查询订单失败:', error);
    throw error;
  }
}

// 验证支付回调签名
export function verifyPaymentCallback(params: Record<string, string>): boolean {
  const { sign, sign_type, ...signParams } = params;
  
  if (sign_type !== 'MD5') return false;
  
  const signString = `money=${signParams.money}&name=${signParams.name}&out_trade_no=${signParams.out_trade_no}&pid=${signParams.pid}&trade_no=${signParams.trade_no}&trade_status=${signParams.trade_status}&type=${signParams.type}${PAYMENT_CONFIG.KEY}`;
  
  const calculatedSign = CryptoJS.MD5(signString).toString();
  
  return calculatedSign === sign;
}
