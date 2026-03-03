
import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  ExperimentOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  CloudOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

import { QRCodeCanvas } from 'qrcode.react';
import { Popover } from 'antd';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const mobileUrl = `${window.location.origin}/m`;

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getMenuItemStyle = (key: string, color: string) => {
    const isSelected = location.pathname === key || (key !== '/' && location.pathname.startsWith(key));
    return {
      fontSize: '18px',
      color: isSelected ? color : undefined,
    };
  };

  const getMenuItemClass = (key: string, bgClass: string) => {
    const isSelected = location.pathname === key || (key !== '/' && location.pathname.startsWith(key));
    return `my-3 py-6 rounded-xl transition-all duration-300 ${isSelected ? bgClass + ' shadow-sm' : 'hover:bg-gray-50'}`;
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined style={getMenuItemStyle('/dashboard', '#1890ff')} />,
      label: <span className="text-base font-medium">工作台</span>,
      onClick: () => navigate('/dashboard'),
      className: getMenuItemClass('/dashboard', 'bg-blue-50 text-blue-600')
    },
    {
      key: '/greenhouses',
      icon: <ShopOutlined style={getMenuItemStyle('/greenhouses', '#52c41a')} />,
      label: <span className="text-base font-medium">大棚管理</span>,
      onClick: () => navigate('/greenhouses'),
      className: getMenuItemClass('/greenhouses', 'bg-green-50 text-green-600')
    },
    {
      key: '/crops',
      icon: <ExperimentOutlined style={getMenuItemStyle('/crops', '#fa8c16')} />,
      label: <span className="text-base font-medium">作物管理</span>,
      onClick: () => navigate('/crops'),
      className: getMenuItemClass('/crops', 'bg-orange-50 text-orange-600')
    },
    {
      key: '/farming-plans',
      icon: <ScheduleOutlined style={getMenuItemStyle('/farming-plans', '#722ed1')} />,
      label: <span className="text-base font-medium">农事计划</span>,
      onClick: () => navigate('/farming-plans'),
      className: getMenuItemClass('/farming-plans', 'bg-purple-50 text-purple-600')
    },
    {
      key: '/farming-records',
      icon: <FileTextOutlined style={getMenuItemStyle('/farming-records', '#eb2f96')} />,
      label: <span className="text-base font-medium">农事记录</span>,
      onClick: () => navigate('/farming-records'),
      className: getMenuItemClass('/farming-records', 'bg-pink-50 text-pink-600')
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined style={getMenuItemStyle('/inventory', '#595959')} />,
      label: <span className="text-base font-medium">库存管理</span>,
      className: getMenuItemClass('/inventory', 'bg-gray-100 text-gray-700'),
      children: [
        {
          key: '/inventory/dashboard',
          label: '库存概览',
          onClick: () => navigate('/inventory/dashboard'),
        },
        {
          key: '/inventory/products',
          label: '货品基础',
          onClick: () => navigate('/inventory/products'),
        },
        {
          key: '/inventory/inbound',
          label: '入库管理',
          onClick: () => navigate('/inventory/inbound'),
        },
        {
          key: '/inventory/outbound',
          label: '出库管理',
          onClick: () => navigate('/inventory/outbound'),
        },
        {
          key: '/inventory/operations',
          label: '库存操作',
          onClick: () => navigate('/inventory/operations'),
        },
        {
          key: '/inventory/reports',
          label: '库存查询',
          onClick: () => navigate('/inventory/reports'),
        },
      ]
    },
    {
      key: '/personnel',
      icon: <UserOutlined style={getMenuItemStyle('/personnel', '#13c2c2')} />,
      label: <span className="text-base font-medium">人员管理</span>,
      onClick: () => navigate('/personnel'),
      className: getMenuItemClass('/personnel', 'bg-cyan-50 text-cyan-600')
    },
    {
      key: '/weather',
      icon: <CloudOutlined style={getMenuItemStyle('/weather', '#096dd9')} />,
      label: <span className="text-base font-medium">环境气象</span>,
      onClick: () => navigate('/weather'),
      className: getMenuItemClass('/weather', 'bg-blue-50 text-blue-600')
    },
    {
      key: '/reports',
      icon: <BarChartOutlined style={getMenuItemStyle('/reports', '#2f54eb')} />,
      label: <span className="text-base font-medium">数据报表</span>,
      onClick: () => navigate('/reports'),
      className: getMenuItemClass('/reports', 'bg-indigo-50 text-indigo-600')
    },
  ];

  const userMenuItems: any[] = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const userMenu = { items: userMenuItems };

  return (
    <Layout className="h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        className="shadow-xl z-20 border-r border-gray-100 bg-gray-50/50"
        width={260}
      >
        <div className="h-20 flex items-center justify-center border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                {collapsed ? '智' : 'AI'}
            </div>
            {!collapsed && (
                <span className="text-xl font-bold text-gray-800 tracking-wide">
                    智慧大棚
                </span>
            )}
          </div>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-r-0 px-3 text-gray-600 bg-transparent"
        />
      </Sider>
      <Layout>
        <Header className="bg-white p-0 shadow-sm flex justify-between items-center px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-16 h-16"
          />
          <Space size="large">
            <Popover 
                content={
                    <div className="text-center p-2">
                        <QRCodeCanvas value={mobileUrl} size={150} />
                        <div className="mt-2 text-gray-500 text-sm">扫码直接访问手机版</div>
                    </div>
                } 
                title="手机端访问" 
                trigger="hover"
            >
                <Button onClick={() => navigate('/m')} type="link">手机版</Button>
            </Popover>

            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                <Avatar icon={<UserOutlined />} className="bg-primary" />
                <span className="text-gray-700 font-medium">{user?.full_name || user?.email}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          className="m-6 p-6 bg-white rounded-lg shadow-sm overflow-auto"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
