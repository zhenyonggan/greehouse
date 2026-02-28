
import React from 'react';
import { List, Button, Avatar } from 'antd-mobile';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const MobileProfile: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-600 p-6 text-white mb-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user?.full_name?.charAt(0)}
            </div>
            <div>
                <div className="text-xl font-bold">{user?.full_name}</div>
                <div className="text-sm opacity-80">{user?.email}</div>
            </div>
        </div>
      </div>

      <List header='基本信息' className="mb-4">
        <List.Item extra={user?.department}>部门</List.Item>
        <List.Item extra={user?.position}>职位</List.Item>
      </List>

      <List header='系统设置' className="mb-6">
        <List.Item onClick={() => {}}>修改密码</List.Item>
        <List.Item onClick={() => {}}>关于我们</List.Item>
      </List>

      <div className="px-4">
        <Button block color='danger' onClick={handleLogout}>
            退出登录
        </Button>
      </div>
    </div>
  );
};

export default MobileProfile;
