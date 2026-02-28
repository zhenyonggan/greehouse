import React from 'react';
import ReactECharts from 'echarts-for-react';
import { SoilData } from '../../../../types/weather';

interface Props {
  data: SoilData[];
}

const SoilCondition: React.FC<Props> = ({ data }) => {
  const times = data.map(item => item.time);
  const temps = data.map(item => item.temperature);
  const moisture = data.map(item => item.moisture);

  const tempOption = {
    grid: { top: 40, bottom: 20, left: 10, right: 10, containLabel: false },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { show: true, lineStyle: { color: '#666' } },
      axisLabel: { color: '#ccc', fontSize: 10 }
    },
    yAxis: { show: false, min: Math.min(...temps) - 1, max: Math.max(...temps) + 1 },
    series: [{
      data: temps,
      type: 'line',
      smooth: true,
      symbol: 'none',
      itemStyle: { color: '#F97316' }, // Orange
      lineStyle: { width: 2 },
      label: { show: true, position: 'top', color: '#fff', formatter: '{c}°C' }
    }]
  };

  const moistureOption = {
    grid: { top: 40, bottom: 20, left: 10, right: 10, containLabel: false },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { show: true, lineStyle: { color: '#666' } },
      axisLabel: { color: '#ccc', fontSize: 10 }
    },
    yAxis: { show: false, min: Math.min(...moisture) - 5, max: Math.max(...moisture) + 5 },
    series: [{
      data: moisture,
      type: 'line',
      smooth: true,
      symbol: 'none',
      itemStyle: { color: '#3B82F6' }, // Blue
      lineStyle: { width: 2 },
      label: { show: true, position: 'top', color: '#fff', formatter: '{c}%' }
    }]
  };

  return (
    <div className="space-y-6">
      {/* Soil Temperature */}
      <div>
        <h4 className="text-sm font-bold mb-2 pl-2 border-l-2 border-orange-500">土温</h4>
        <div className="h-24 bg-white/5 rounded-lg p-2">
           <ReactECharts option={tempOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
      </div>

      {/* Soil Moisture */}
      <div>
        <h4 className="text-sm font-bold mb-2 pl-2 border-l-2 border-blue-500">土湿</h4>
        <div className="h-24 bg-white/5 rounded-lg p-2">
           <ReactECharts option={moistureOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        </div>
      </div>
    </div>
  );
};

export default SoilCondition;
