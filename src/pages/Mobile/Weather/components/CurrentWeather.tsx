import React from 'react';
import { MapPin, Wind, Droplets, Cloud } from 'lucide-react';
import { CurrentWeather as CurrentWeatherType } from '../../../../types/weather';

interface Props {
  data: CurrentWeatherType;
}

const CurrentWeather: React.FC<Props> = ({ data }) => {
  return (
    <div className="text-white p-4 pt-8">
      {/* Location */}
      <div className="flex items-center gap-1 text-sm mb-4">
        <MapPin size={16} />
        <span>{data.location}</span>
      </div>

      {/* Main Temp & Condition */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-7xl font-light">{data.temperature}°C</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{data.condition.text}</span>
            <Cloud className="text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="flex items-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-1">
          <Wind size={16} />
          <span>{data.windDirection}{data.windLevel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets size={16} />
          <span>{data.humidity}%</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
