
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LockOutlined, CloudOutlined, DatabaseOutlined, MobileOutlined, CheckOutlined } from '@ant-design/icons';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'account' | 'sms'>('account');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const { data, error } = await authService.loginWithPassword(values.email, values.password);
      if (error) {
        message.error(error.message);
      } else if (data.session) {
        message.success('登录成功');
        setTimeout(() => {
             navigate(from, { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#1E212B] overflow-hidden flex items-center justify-center lg:justify-end lg:pr-32">
      {/* Background Illustration Layer - Positioned Absolute */}
      <div className="absolute inset-0 z-0 flex items-center justify-start pl-20 pointer-events-none">
        {/* Abstract 3D Tech Elements */}
        <div className="relative w-[800px] h-[600px] scale-125 transform translate-y-20">
            {/* Base Platform */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#111] to-[#000] rounded-[50px] transform rotate-x-60 border border-blue-900/30 shadow-[0_0_100px_rgba(0,100,255,0.15)]"></div>
            
            {/* Center Cube */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-blue-600/20 to-cyan-400/10 backdrop-blur-md border border-cyan-400/50 rounded-2xl flex items-center justify-center shadow-[0_0_80px_rgba(0,200,255,0.4)] z-20">
                <div className="text-cyan-300 text-7xl animate-pulse"><DatabaseOutlined /></div>
                {/* Floating Rings */}
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full scale-150 animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-0 border border-blue-500/20 rounded-full scale-[1.8] animate-[spin_15s_linear_infinite_reverse]"></div>
            </div>

            {/* Satellite Elements */}
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 w-28 h-28 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <CloudOutlined className="text-blue-400 text-5xl" />
            </div>
            <div className="absolute top-1/4 right-20 w-28 h-28 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <MobileOutlined className="text-blue-400 text-5xl" />
            </div>
            <div className="absolute bottom-20 left-32 w-28 h-28 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-center z-10 shadow-lg">
                <div className="w-14 h-14 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                <path d="M200 300 L350 250" stroke="#0EA5E9" strokeWidth="2" />
                <path d="M600 200 L450 250" stroke="#0EA5E9" strokeWidth="2" />
                <path d="M250 450 L350 350" stroke="#0EA5E9" strokeWidth="2" />
            </svg>
        </div>
      </div>
        
      {/* Branding Text - Top Left */}
      <div className="absolute top-10 left-10 flex items-center gap-3 z-30">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
            <span className="transform -rotate-45">AI</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wider italic" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            一体化智慧种植设备管理平台
        </h1>
      </div>

      {/* Login Card - Right Side */}
      <div className="w-full max-w-sm bg-[#1A1D26]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 mr-0 lg:mr-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">欢迎登录</h2>
            <p className="text-gray-400 text-xs uppercase tracking-widest">— welcome to login —</p>
          </div>

          {/* Title Only - No Tabs */}
          <div className="mb-6 text-center">
             <span className="text-[#00D1FF] text-sm font-medium border-b-2 border-[#00D1FF] pb-2">
                账户密码
             </span>
          </div>

          <Form
            name="login"
            initialValues={{ remember: false }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-6"
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: '' }]}
              className="mb-0"
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400 text-lg mr-2" />} 
                placeholder="请输入账号" 
                className="bg-[#2A2E3B] border-none text-white placeholder-gray-500 h-12 rounded-lg hover:bg-[#323642] focus:bg-[#323642] focus:shadow-[0_0_0_2px_rgba(0,209,255,0.2)]"
                style={{ color: 'white' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '' }]}
              className="mb-0"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400 text-lg mr-2" />} 
                placeholder="请输入密码" 
                className="bg-[#2A2E3B] border-none text-white placeholder-gray-500 h-12 rounded-lg hover:bg-[#323642] focus:bg-[#323642] focus:shadow-[0_0_0_2px_rgba(0,209,255,0.2)]"
                style={{ color: 'white' }}
              />
            </Form.Item>

            {/* Login Button */}
            <Form.Item className="mb-0 pt-4">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#0066FF] to-[#00D1FF] hover:opacity-90 border-none text-white font-medium text-base shadow-[0_4px_20px_rgba(0,100,255,0.3)]"
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
      </div>
    </div>
  );
};

export default Login;
