export interface WeatherCondition {
  text: string;
  code: string;
  icon?: string;
}

export interface CurrentWeather {
  location: string;
  temperature: number;
  humidity: number;
  windDirection: string;
  windLevel: string;
  condition: WeatherCondition;
  updateTime: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: WeatherCondition;
  windDirection: string;
  windLevel: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  conditionDay: WeatherCondition;
  conditionNight: WeatherCondition;
  tempMax: number;
  tempMin: number;
  windDirection: string;
  windLevel: string;
}

export interface SoilData {
  time: string;
  temperature: number;
  moisture: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  soil: SoilData[];
}
