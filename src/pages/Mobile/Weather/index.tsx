import React, { useEffect, useState } from 'react';
import { weatherService } from '../../../services/weatherService';
import { WeatherData } from '../../../types/weather';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import SoilCondition from './components/SoilCondition';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { CascadePicker, Toast } from 'antd-mobile';
// @ts-ignore
import chinaData from 'china-area-data';

// Process china-area-data to Antd Mobile Picker columns
const provinces = chinaData['86'];
const provinceList = Object.keys(provinces).map(code => ({ label: provinces[code], value: code }));

const WeatherPage: React.FC = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [locationName, setLocationName] = useState('');

  const loadData = async (locationId?: string, displayName?: string) => {
    setLoading(true);
    try {
      const result = await weatherService.getWeather(locationId);
       if (displayName) {
        result.current.location = displayName;
      } else if (!result.current.location && locationName) {
        result.current.location = locationName;
      }
      setData(result);
    } catch (error) {
      console.error('Failed to load weather data', error);
      Toast.show({ content: '获取气象数据失败' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('weather_location');
    if (savedLocation) {
      const { id, name } = JSON.parse(savedLocation);
      setLocationName(name);
      loadData(id, name);
    } else {
      loadData();
    }
  }, []);

  // Dynamic Picker Data Logic
  const onPickerConfirm = async (value: (string | null)[]) => {
    // value is array of codes e.g. ['110000', '110100', '110101']
    if (!value || value.length < 3) return;
    
    const pCode = value[0] as string;
    const cCode = value[1] as string;
    const dCode = value[2] as string;

    const pName = chinaData['86'][pCode];
    const cName = chinaData[pCode][cCode];
    const dName = chinaData[cCode][dCode];
    
    const fullName = `${pName} ${cName} ${dName}`;
    
    Toast.show({
        icon: 'loading',
        content: `切换至 ${dName}...`,
        duration: 0,
    });

    try {
        const locationInfo = await weatherService.searchLocation(dName, cName);
        Toast.clear();
        
        if (locationInfo) {
             localStorage.setItem('weather_location', JSON.stringify({
                id: locationInfo.id,
                name: fullName
              }));
              setLocationName(fullName);
              await loadData(locationInfo.id, fullName);
              Toast.show({ icon: 'success', content: '切换成功' });
        } else {
             Toast.show({ icon: 'fail', content: '未找到气象数据' });
        }
    } catch (e) {
        Toast.clear();
        Toast.show({ icon: 'fail', content: '切换失败' });
    }
  };

  // Helper to generate columns for Picker
  const generateColumns = (value: string[]) => {
      // Logic for CascadePicker or just Picker? Antd Mobile Picker is simpler but CascadePicker is better for regions.
      // Antd Mobile v5 has CascadePicker.
      return [];
  };

  // Using CascadePicker options structure
  const getCascadeOptions = () => {
      return Object.keys(provinces).map(pCode => {
          const cities = chinaData[pCode] || {};
          return {
              label: provinces[pCode],
              value: pCode,
              children: Object.keys(cities).map(cCode => {
                  const districts = chinaData[cCode] || {};
                  return {
                      label: cities[cCode],
                      value: cCode,
                      children: Object.keys(districts).map(dCode => ({
                          label: districts[dCode],
                          value: dCode
                      }))
                  };
              })
          };
      });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Nav Bar */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                <ArrowLeft size={24} />
            </button>
            <span className="ml-2 font-medium">天气详情</span>
          </div>
          <button 
            onClick={() => setPickerVisible(true)}
            className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-transform"
          >
            <MapPin size={14} />
            <span>切换城市</span>
          </button>
        </div>

        {/* Picker Component */}
        <CascadePicker
            visible={pickerVisible}
            onClose={() => setPickerVisible(false)}
            onConfirm={onPickerConfirm}
            options={getCascadeOptions()} 
        />
        
        {data && <CurrentWeather data={data.current} />}
        
        {/* Hourly Forecast */}
        <div className="px-4 mt-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-white rounded-full"></span>
            24小时天气预报
          </h3>
          <div className="bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
             {data && <HourlyForecast data={data.hourly} />}
          </div>
        </div>

        {/* Daily Forecast */}
        <div className="px-4 mt-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-white rounded-full"></span>
            15日天气预报
          </h3>
          <div className="bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
             {data && <DailyForecast data={data.daily} />}
          </div>
        </div>
        
        {/* Soil Condition */}
        <div className="px-4 mt-6 mb-8">
           <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-white rounded-full"></span>
            土壤墒情
          </h3>
           <div className="bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm p-4">
             {data && <SoilCondition data={data.soil} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
