import React from 'react';
import ReactECharts from 'echarts-for-react';
import { DailyForecast as DailyForecastType } from '../../../../types/weather';

interface Props {
  data: DailyForecastType[];
}

const DailyForecast: React.FC<Props> = ({ data }) => {
  const dates = data.map(item => item.dayOfWeek);
  const maxTemps = data.map(item => item.tempMax);
  const minTemps = data.map(item => item.tempMin);

  const option = {
    grid: {
      top: 40,
      bottom: 30,
      left: 20,
      right: 20,
    },
    title: {
      show: false,
    },
    legend: {
      show: true,
      top: 0,
      textStyle: { color: '#ccc', fontSize: 10 }
    },
    xAxis: {
      type: 'category',
      data: dates,
      show: false // Hide axis, we render labels manually
    },
    yAxis: {
      show: false,
      min: Math.min(...minTemps) - 5,
      max: Math.max(...maxTemps) + 5
    },
    series: [
      {
        name: 'Max Temp',
        data: maxTemps,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#FFA500' },
        lineStyle: { width: 2 },
        label: { show: true, position: 'top', color: '#fff', formatter: '{c}°' }
      },
      {
        name: 'Min Temp',
        data: minTemps,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#60A5FA' }, // Blueish for cold
        lineStyle: { width: 2 },
        label: { show: true, position: 'bottom', color: '#fff', formatter: '{c}°' }
      }
    ]
  };

  const width = Math.max(window.innerWidth, data.length * 80);

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div style={{ width: `${width}px` }} className="p-4">
        {/* Header Row: Date & Condition */}
        <div className="flex justify-between px-4 mb-2">
           {data.map((item, index) => (
             <div key={index} className="flex flex-col items-center w-12 gap-1">
               <span className="text-sm font-bold">{item.dayOfWeek}</span>
               <span className="text-xs text-gray-400">{item.date}</span>
               <span className="text-xs mt-1">{item.conditionDay.text}</span>
               <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center my-1">
                  <span className="text-[10px]">⛅</span>
               </div>
             </div>
           ))}
        </div>

        {/* Chart Area */}
        <div className="h-40">
           <ReactECharts 
             option={option} 
             style={{ height: '100%', width: '100%' }} 
             opts={{ renderer: 'svg' }}
           />
        </div>

        {/* Footer Row: Wind */}
        <div className="flex justify-between px-4 mt-2">
           {data.map((item, index) => (
             <div key={index} className="flex flex-col items-center w-12 gap-1">
               <span className="text-xs text-gray-400">{item.windDirection}</span>
               <span className="text-xs text-gray-400">{item.windLevel}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DailyForecast;
