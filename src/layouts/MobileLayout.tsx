
import React, { useEffect } from 'react';
import { TabBar } from 'antd-mobile';
import { 
  AppOutline, 
  UnorderedListOutline, 
  UserOutline,
  CalendarOutline 
} from 'antd-mobile-icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const MobileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const setRouteActive = (value: string) => {
    navigate(value);
  };

  const tabs = [
    {
      key: '/m/dashboard',
      title: '工作台',
      icon: <AppOutline />,
    },
    {
      key: '/m/greenhouses',
      title: '大棚',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/m/tasks',
      title: '任务',
      icon: <CalendarOutline />,
    },
    {
      key: '/m/profile',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <div className="bg-white border-t border-gray-100">
        <TabBar activeKey={pathname} onChange={value => setRouteActive(value)}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default MobileLayout;
