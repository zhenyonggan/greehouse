import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Statistic, Typography, Cascader, message } from 'antd';
import { CloudOutlined, EnvironmentOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { weatherService } from '../../services/weatherService';
import { WeatherData } from '../../types/weather';
import dayjs from 'dayjs';
// @ts-ignore
import chinaData from 'china-area-data';

const { Title, Text } = Typography;

// Process china-area-data to Antd Cascader options
const provinces = chinaData['86'];
const options = Object.keys(provinces).map(provinceCode => {
  const cities = chinaData[provinceCode];
  return {
    value: provinces[provinceCode],
    label: provinces[provinceCode],
    children: cities ? Object.keys(cities).map(cityCode => {
      const districts = chinaData[cityCode];
      return {
        value: cities[cityCode],
        label: cities[cityCode],
        children: districts ? Object.keys(districts).map(districtCode => ({
          value: districts[districtCode],
          label: districts[districtCode]
        })) : []
      };
    }) : []
  };
});

const WeatherPage: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('');

  const loadData = async (locationId?: string, displayName?: string) => {
    setLoading(true);
    try {
      // Ensure we pass locationId even if it is undefined (default will be used inside service)
      const result = await weatherService.getWeather(locationId);
      
      // If we have a custom display name, use it, otherwise use what API returns or keep blank
      if (displayName) {
        result.current.location = displayName;
      } else if (!result.current.location && locationName) {
        result.current.location = locationName;
      }
      setData(result);
    } catch (error) {
      console.error('Failed to load weather data', error);
      message.error('获取气象数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check localStorage
    const savedLocation = localStorage.getItem('weather_location');
    if (savedLocation) {
      const { id, name } = JSON.parse(savedLocation);
      setLocationName(name);
      loadData(id, name);
    } else {
      loadData(); // Default
    }
  }, []);

  const onLocationChange = async (value: string[]) => {
    if (value && value.length > 0) {
      const district = value[value.length - 1];
      const city = value.length > 1 ? value[value.length - 2] : undefined;
      const fullName = value.join(' ');
      
      message.loading({ content: `正在切换至 ${fullName}...`, key: 'weather_switch' });
      
      try {
        // Search for Location ID
        const locationInfo = await weatherService.searchLocation(district, city);
        
        if (locationInfo) {
          // Save to localStorage
          localStorage.setItem('weather_location', JSON.stringify({
            id: locationInfo.id,
            name: fullName
          }));
          
          setLocationName(fullName);
          // Pass the new ID explicitly to loadData
          await loadData(locationInfo.id, fullName);
          message.success({ content: `已切换至 ${fullName}`, key: 'weather_switch' });
        } else {
          message.error({ content: '未找到该地区气象数据', key: 'weather_switch' });
        }
      } catch (error) {
        message.error({ content: '切换城市失败', key: 'weather_switch' });
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="加载气象数据中..." />
      </div>
    );
  }

  // ECharts Options (Keep existing options)
  const hourlyOption = data ? {
    title: { text: '24小时气温趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.hourly.map(item => item.time),
    },
    yAxis: { type: 'value', axisLabel: { formatter: '{value} °C' } },
    series: [{
      data: data.hourly.map(item => item.temperature),
      type: 'line',
      smooth: true,
      itemStyle: { color: '#fa8c16' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(250, 140, 22, 0.5)' }, { offset: 1, color: 'rgba(250, 140, 22, 0)' }]
        }
      }
    }]
  } : {};

  const dailyOption = data ? {
    title: { text: '15天温度预报', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['最高温', '最低温'], top: 40 },
    grid: { top: 80, bottom: 30, left: 50, right: 20 },
    xAxis: {
      type: 'category',
      data: data.daily.map(item => `${item.date}\n${item.dayOfWeek}`),
    },
    yAxis: { type: 'value', axisLabel: { formatter: '{value} °C' } },
    series: [
      {
        name: '最高温',
        data: data.daily.map(item => item.tempMax),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#ff4d4f' },
        label: { show: true, position: 'top' }
      },
      {
        name: '最低温',
        data: data.daily.map(item => item.tempMin),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#1890ff' },
        label: { show: true, position: 'bottom' }
      }
    ]
  } : {};

  const soilOption = data ? {
    title: { text: '土壤温湿度监测', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['土壤温度 (°C)', '土壤湿度 (%)'], top: 40 },
    grid: { top: 80, bottom: 30, left: 50, right: 50 },
    xAxis: {
      type: 'category',
      data: data.soil.map(item => item.time),
    },
    yAxis: [
      { type: 'value', name: '温度', position: 'left', axisLabel: { formatter: '{value} °C' } },
      { type: 'value', name: '湿度', position: 'right', axisLabel: { formatter: '{value} %' } }
    ],
    series: [
      {
        name: '土壤温度 (°C)',
        data: data.soil.map(item => item.temperature),
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        itemStyle: { color: '#fa8c16' }
      },
      {
        name: '土壤湿度 (%)',
        data: data.soil.map(item => item.moisture),
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        itemStyle: { color: '#13c2c2' }
      }
    ]
  } : {};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <div>
          <Title level={2} style={{ margin: 0 }}>环境气象监测</Title>
          <Text type="secondary">实时监测当地气象数据及土壤环境</Text>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
           <div className="flex items-center gap-2">
             <Cascader 
                options={options} 
                onChange={(value) => onLocationChange(value as string[])} 
                placeholder="切换地区" 
                style={{ width: 250 }}
                expandTrigger="hover"
             />
           </div>
           
           {data && (
             <>
                <div className="flex items-center gap-2 text-gray-500 justify-end mt-1">
                    <EnvironmentOutlined />
                    <span className="font-bold text-gray-700">{data.current.location || locationName}</span>
                </div>
                <div className="text-sm text-gray-400">更新时间: {data.current.updateTime}</div>
             </>
           )}
        </div>
      </div>

      {data && (
      <Row gutter={[24, 24]}>
        {/* Current Weather Card */}
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                  <div>
                    <div className="text-6xl font-light mb-2">{data.current.temperature}°</div>
                    <div className="text-xl opacity-90">{data.current.condition.text}</div>
                  </div>
                  <CloudOutlined style={{ fontSize: '64px', opacity: 0.8 }} />
               </div>
               <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
                  <div>
                    <div className="text-sm opacity-70">风向风力</div>
                    <div className="text-lg font-medium">{data.current.windDirection} {data.current.windLevel}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">空气湿度</div>
                    <div className="text-lg font-medium">{data.current.humidity}%</div>
                  </div>
               </div>
            </div>
          </Card>
        </Col>

        {/* 24 Hour Forecast */}
        <Col xs={24} md={16}>
          <Card bordered={false} className="shadow-sm rounded-xl h-full">
            <ReactECharts option={hourlyOption} style={{ height: '300px' }} />
          </Card>
        </Col>

        {/* 15 Day Forecast */}
        <Col xs={24} lg={12}>
           <Card bordered={false} className="shadow-sm rounded-xl">
             <ReactECharts option={dailyOption} style={{ height: '350px' }} />
           </Card>
        </Col>

        {/* Soil Condition */}
        <Col xs={24} lg={12}>
           <Card bordered={false} className="shadow-sm rounded-xl">
             <ReactECharts option={soilOption} style={{ height: '350px' }} />
           </Card>
        </Col>
      </Row>
      )}
    </div>
  );
};

export default WeatherPage;
