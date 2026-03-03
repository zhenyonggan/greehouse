
import { useEffect } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { authService } from './services/authService';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Personnel from './pages/Personnel';
import Weather from './pages/Weather';
import Crops from './pages/Crops';
import Greenhouses from './pages/Greenhouses';
import GreenhouseDetail from './pages/Greenhouses/GreenhouseDetail';
import FarmingPlans from './pages/FarmingPlans';
import FarmingRecords from './pages/FarmingRecords';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

import InventoryDashboard from './pages/Inventory/Dashboard';
import ProductManagement from './pages/Inventory/Products';
import InboundManagement from './pages/Inventory/Inbound';
import OutboundManagement from './pages/Inventory/Outbound';
import OperationsManagement from './pages/Inventory/Operations';
import ReportsManagement from './pages/Inventory/Reports';

import MobileLayout from './layouts/MobileLayout';
import MobileDashboard from './pages/Mobile/Dashboard';
import MobileGreenhouses from './pages/Mobile/GreenhouseList';
import MobileGreenhouseDetail from './pages/Mobile/GreenhouseDetail';
import MobileTasks from './pages/Mobile/TaskList';
import MobileProfile from './pages/Mobile/Profile';
import MobileWeather from './pages/Mobile/Weather';

function App() {
  useEffect(() => {
    authService.initialize();
  }, []);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2E7D32',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Desktop Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/greenhouses" element={<Greenhouses />} />
              <Route path="/greenhouses/:id" element={<GreenhouseDetail />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/farming-plans" element={<FarmingPlans />} />
              <Route path="/farming-records" element={<FarmingRecords />} />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />

              {/* Inventory Routes */}
              <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
              <Route path="/inventory/products" element={<ProductManagement />} />
              <Route path="/inventory/inbound" element={<InboundManagement />} />
              <Route path="/inventory/outbound" element={<OutboundManagement />} />
              <Route path="/inventory/operations" element={<OperationsManagement />} />
              <Route path="/inventory/reports" element={<ReportsManagement />} />
            </Route>
          </Route>

          {/* Mobile Routes */}
          <Route path="/m" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/m/dashboard" replace />} />
              <Route path="dashboard" element={<MobileDashboard />} />
              <Route path="greenhouses" element={<MobileGreenhouses />} />
              <Route path="greenhouses/:id" element={<MobileGreenhouseDetail />} />
              <Route path="tasks" element={<MobileTasks />} />
              <Route path="tasks/:id" element={<div>任务详情 (开发中)</div>} />
              <Route path="weather" element={<MobileWeather />} />
              <Route path="profile" element={<MobileProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
