import React from 'react';
import ReactECharts from 'echarts-for-react';
import { HourlyForecast as HourlyForecastType } from '../../../../types/weather';
import * as echarts from 'echarts';

interface Props {
  data: HourlyForecastType[];
}

const HourlyForecast: React.FC<Props> = ({ data }) => {
  const times = data.map(item => item.time);
  const temps = data.map(item => item.temperature);

  const option = {
    grid: {
      top: 40,
      bottom: 20,
      left: 20,
      right: 20,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#fff',
        fontSize: 12,
        interval: 0 // Show all labels
      }
    },
    yAxis: {
      show: false,
      min: Math.min(...temps) - 2,
      max: Math.max(...temps) + 2
    },
    series: [
      {
        data: temps,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#FFA500' // Orange color for the line/points
        },
        lineStyle: {
          width: 2
        },
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          formatter: '{c}°'
        }
      }
    ]
  };

  // For icons and wind, we might render them outside the chart for easier styling
  // or use a complex ECharts setup. 
  // Given the requirement "Simple operation, clean interface", let's try a hybrid approach:
  // Use a flex container. The image shows a very structured grid.
  // Actually, a scrollable Flexbox is often better for mobile than ECharts for this specific layout 
  // because aligning icons + text + wind + chart exactly is hard in ECharts responsiveness.
  // BUT, the trend line is best done with SVG/Canvas.
  
  // Let's use a scrollable container with a fixed-width chart inside.
  
  const width = Math.max(window.innerWidth, data.length * 70); // Ensure enough width for scroll

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <div style={{ width: `${width}px` }} className="relative p-4">
        {/* Top: Time & Chart */}
        <div className="h-32">
           <ReactECharts 
             option={option} 
             style={{ height: '100%', width: '100%' }} 
             opts={{ renderer: 'svg' }}
           />
        </div>

        {/* Bottom: Weather Condition & Wind */}
        <div className="flex justify-between px-5 -mt-2">
            {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-10">
                    <span className="text-xs text-blue-200">{item.condition.text}</span>
                    {/* Placeholder for icon - could use dynamic icon mapping */}
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-[10px]">☁️</span>
                    </div>
                    <span className="text-xs text-gray-400">{item.windDirection}</span>
                    <span className="text-xs text-gray-400">{item.windLevel}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
