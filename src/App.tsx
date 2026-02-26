
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
import Crops from './pages/Crops';
import Greenhouses from './pages/Greenhouses';
import GreenhouseDetail from './pages/Greenhouses/GreenhouseDetail';
import FarmingPlans from './pages/FarmingPlans';
import FarmingRecords from './pages/FarmingRecords';
import Reports from './pages/Reports';

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
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Placeholders for other routes */}
              <Route path="/greenhouses" element={<Greenhouses />} />
              <Route path="/greenhouses/:id" element={<GreenhouseDetail />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/farming-plans" element={<FarmingPlans />} />
              <Route path="/farming-records" element={<FarmingRecords />} />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<div>个人资料 (开发中)</div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
