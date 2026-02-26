
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
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
        // Small delay to ensure state is updated
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
    <div className="flex justify-center items-center h-screen bg-green-50">
      <Card className="w-96 shadow-lg rounded-xl">
        <div className="text-center mb-8">
          <Title level={3} className="text-primary">智慧大棚管理系统</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱!' }, { type: 'email', message: '请输入有效的邮箱地址!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-primary hover:bg-primary-light" loading={loading}>
              登录
            </Button>
            <div className="text-center mt-2">
              没有账号？ <Link to="/register">去注册</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
