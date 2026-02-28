
import React, { useState } from 'react';
import { Card, Descriptions, Button, Form, Input, message, Avatar, Tag, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

const Profile: React.FC = () => {
  const { user, roles } = useAuthStore();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (values: any) => {
    setLoading(true);
    try {
      const { error } = await authService.updatePassword(values.newPassword);
      if (error) {
        message.error('密码更新失败: ' + error.message);
      } else {
        message.success('密码更新成功');
        passwordForm.resetFields();
      }
    } catch (error) {
      console.error(error);
      message.error('系统错误');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">个人中心</h1>

      <Row gutter={24}>
        {/* 左侧：基本信息卡片 */}
        <Col span={24} md={8}>
          <Card bordered={false} className="shadow-sm mb-6 text-center">
            <Avatar 
                size={100} 
                icon={<UserOutlined />} 
                className="bg-green-600 mb-4"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-1">{user.full_name}</h2>
            <p className="text-gray-500 mb-4">{user.email}</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
                {roles.map(role => (
                    <Tag key={role} color="blue">{role}</Tag>
                ))}
            </div>
          </Card>
        </Col>

        {/* 右侧：详细信息与设置 */}
        <Col span={24} md={16}>
          <Card title="基本资料" bordered={false} className="shadow-sm mb-6">
            <Descriptions column={1} labelStyle={{ width: '100px', fontWeight: 'bold' }}>
                <Descriptions.Item label="姓名">{user.full_name}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
                <Descriptions.Item label="部门">{user.department || '未分配'}</Descriptions.Item>
                <Descriptions.Item label="职位">{user.position || '未分配'}</Descriptions.Item>
                <Descriptions.Item label="技能">
                    {user.skills && user.skills.length > 0 ? (
                        <div className="flex gap-1">
                            {user.skills.map((skill: string) => (
                                <Tag key={skill}>{skill}</Tag>
                            ))}
                        </div>
                    ) : '暂无'}
                </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="安全设置" bordered={false} className="shadow-sm">
            <h3 className="text-base font-medium mb-4 flex items-center">
                <LockOutlined className="mr-2" /> 修改密码
            </h3>
            <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleUpdatePassword}
            >
                <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码长度至少为6位' }
                    ]}
                >
                    <Input.Password placeholder="请输入新密码" />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="请再次输入新密码" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                        更新密码
                    </Button>
                </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
