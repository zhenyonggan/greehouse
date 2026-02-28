import { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, SoilData } from '../types/weather';

const AIKENONG_BASE_URL = 'https://znapi.aikenong.com.cn';

// OpenStreetMap Nominatim API for Geo Lookup (No key required, better than broken QWeather)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// 默认位置：北京市平谷区
const DEFAULT_LAT = 40.14;
const DEFAULT_LON = 117.12;

interface GeoLookupResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

interface AikenongWeatherResponse {
  result: number;
  tkCheck: boolean;
  msg: string;
  errorMsg: string | null;
  data: {
    pm10: number;
    pm25: number;
    quality: number;
    humidity: number;
    temperature: number;
    temHigh: string; // "高温 2℃"
    temLow: string; // "低温 0℃"
    windPower: string; // "3级"
    windDirect: string; // "东风"
    weatherCode: string;
    weatherType: string;
    weatherCodeDaily: string;
    weatherTypeDaily: string;
    weatherCodeNight: string;
    weatherTypeNight: string;
    imgUrl: string;
    dailyImgUrl: string | null;
    nightImgUrl: string;
    calamityContent: string;
    sunrise: string;
    sunset: string;
  }
}

// 辅助函数：根据日期获取星期几
const getDayOfWeek = (dateString: string): string => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const today = new Date().toISOString().split('T')[0];
  if (dateString === today) return '今天';
  return days[new Date(dateString).getDay()];
};

export const weatherService = {
  // 搜索城市 (Using OpenStreetMap Nominatim)
  searchLocation: async (location: string, adm?: string): Promise<{ id: string, name: string, lat: number, lon: number } | null> => {
    try {
      const query = `${adm || ''} ${location}`.trim();
      // Use Accept-Language to get Chinese results if possible, but Nominatim results depend on OSM data
      const res = await fetch(`${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=zh-CN`);
      if (!res.ok) throw new Error(`Nominatim API Error: ${res.status}`);
      const data: GeoLookupResponse[] = await res.json();
      
      if (data.length > 0) {
        return {
          id: `${data[0].lat},${data[0].lon}`, // Use lat,lon as ID
          name: query, // Use the query name for display as it matches user selection
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error("Error searching location:", error);
      return null;
    }
  },

  getWeather: async (locationIdOrCoords: string | {lat: number, lon: number} = {lat: DEFAULT_LAT, lon: DEFAULT_LON}): Promise<WeatherData> => {
    try {
      let lat = DEFAULT_LAT;
      let lon = DEFAULT_LON;
      let locationName = '';

      // Determine Lat/Lon
      if (typeof locationIdOrCoords === 'string') {
        if (locationIdOrCoords.includes(',')) {
            const parts = locationIdOrCoords.split(',');
            lat = parseFloat(parts[0]);
            lon = parseFloat(parts[1]);
        } else {
             // Fallback to default if not 'lat,lon'
        }
      } else {
        lat = locationIdOrCoords.lat;
        lon = locationIdOrCoords.lon;
      }

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const url = `${AIKENONG_BASE_URL}/v2/base-api/info/weather/gettoadyweather?lat=${lat}&lon=${lon}&_t=${timestamp}`;
      console.log(`Fetching weather from Aikenong (Direct): ${url}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
          throw new Error(`Aikenong API Error: ${res.status}`);
      }
      
      const json: AikenongWeatherResponse = await res.json();
      
      if (json.result !== 200 || !json.data) {
          throw new Error(json.msg || 'Aikenong API returned error');
      }

      const data = json.data;

      // 1. Construct CurrentWeather
      const current: CurrentWeather = {
        location: locationName, // UI handles this
        temperature: data.temperature,
        humidity: data.humidity,
        windDirection: data.windDirect,
        windLevel: data.windPower,
        condition: {
          text: data.weatherType,
          code: data.weatherCode, // e.g., "CLOUDY"
          icon: data.weatherCode 
        },
        updateTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };

      // 2. Mock Hourly Forecast
      const high = parseInt(data.temHigh.replace(/[^0-9-]/g, ''));
      const low = parseInt(data.temLow.replace(/[^0-9-]/g, ''));
      
      const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        temperature: low + Math.floor((high - low) * Math.sin((i - 6) * Math.PI / 12) * 0.5 + (high - low) * 0.5), // Simple curve
        condition: {
          text: data.weatherType,
          code: data.weatherCode
        },
        windDirection: data.windDirect,
        windLevel: data.windPower
      }));

      // 3. Mock Daily Forecast
      const days = ['今天', '明天', '后天', '周四', '周五', '周六', '周日'];
      const daily: DailyForecast[] = days.map((day, i) => ({
        date: `03/${(i + 1).toString().padStart(2, '0')}`,
        dayOfWeek: day,
        conditionDay: { text: data.weatherTypeDaily, code: data.weatherCodeDaily },
        conditionNight: { text: data.weatherTypeNight, code: data.weatherCodeNight },
        tempMax: high,
        tempMin: low,
        windDirection: data.windDirect,
        windLevel: data.windPower
      }));

      // 4. Mock Soil Data
      const soil: SoilData[] = [
        { time: '08:00', temperature: 12.5, moisture: 45.2 },
        { time: '10:00', temperature: 14.2, moisture: 44.8 },
        { time: '12:00', temperature: 16.8, moisture: 43.5 },
        { time: '14:00', temperature: 17.5, moisture: 42.1 },
        { time: '16:00', temperature: 16.2, moisture: 42.5 },
        { time: '18:00', temperature: 14.5, moisture: 43.0 },
      ];

      return {
        current,
        hourly,
        daily,
        soil
      };

    } catch (error) {
      console.error("Error fetching weather data:", error);
      return Promise.reject(error);
    }
  },
};
