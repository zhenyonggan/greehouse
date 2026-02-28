# 天气气象功能设计方案

## 1. 功能概述
本功能旨在为智慧大棚用户提供当地及全国的实时气象数据、未来24小时预报、15天长短期预报以及土壤墒情数据。帮助用户根据气象变化及时调整农事活动。

## 2. 核心功能模块 (基于移动端设计)

### 2.1 实时天气 (Header)
- **展示内容**:
  - 当前位置 (如：北京市平谷区)
  - 实时温度 (大字展示)
  - 天气状况 (图标 + 文字，如：阴)
  - 风向风力 (如：东南风 3级)
  - 空气湿度 (如：79%)
- **UI风格**: 深色半透明背景，白色文字，高对比度。

### 2.2 24小时天气预报
- **展示形式**: 横向滚动图表 (ECharts 或 自定义组件)
- **数据点**:
  - 时间轴 (每小时)
  - 温度趋势曲线 (橙色)
  - 天气图标
  - 风向
  - 风力等级

### 2.3 15天天气预报
- **展示形式**: 横向滚动列表/图表
- **数据点**:
  - 日期 (今天, 明天, 星期X)
  - 天气状况 (图标 + 文字)
  - 最高/最低温度 (双曲线趋势)
  - 风向风力

### 2.4 土壤墒情 (农业特色)
- **展示形式**: 趋势折线图
- **数据点**:
  - 土壤温度 (℃)
  - 土壤湿度 (%)
  - 时间轴

## 3. 数据结构设计 (TypeScript Interfaces)

```typescript
// src/types/weather.ts

export interface WeatherCondition {
  text: string; // e.g., "阴", "多云"
  icon: string; // 图标标识
  code: string; // 天气代码
}

export interface CurrentWeather {
  location: string;
  temperature: number;
  humidity: number;
  windDirection: string;
  windLevel: string; // e.g., "3级"
  condition: WeatherCondition;
  updateTime: string;
}

export interface HourlyForecast {
  time: string; // "10:00"
  temperature: number;
  condition: WeatherCondition;
  windDirection: string;
  windLevel: string;
}

export interface DailyForecast {
  date: string; // "02/28"
  dayOfWeek: string; // "今天", "星期日"
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
```

## 4. 技术实现方案

### 4.1 前端技术栈
- **框架**: React + Vite
- **UI库**: Ant Design Mobile (移动端布局), TailwindCSS (样式)
- **图表**: ECharts-for-React (用于绘制温度趋势线、土壤数据图表)
- **图标**: Lucide-React / Ant Design Icons

### 4.2 目录结构
```
src/
  pages/
    Mobile/
      Weather/
        index.tsx        // 主页面
        components/
          WeatherHeader.tsx
          HourlyChart.tsx
          DailyForecast.tsx
          SoilChart.tsx
  services/
    weatherService.ts    // 数据获取服务 (Mock/Real)
  types/
    weather.ts           // 类型定义
```

### 4.3 路由配置
- 新增路由: `/m/weather` (移动端)
- 在底部导航栏或首页功能区添加入口。

## 5. 开发计划
1.  **定义类型**: 创建 `src/types/weather.ts`。
2.  **模拟数据**: 在 `src/services/weatherService.ts` 中创建符合 UI 截图的 Mock 数据。
3.  **组件开发**:
    - 实现 `WeatherHeader` (基础信息)。
    - 实现 `HourlyChart` (使用 ECharts 实现 24小时温度曲线)。
    - 实现 `DailyForecast` (15天预报)。
    - 实现 `SoilChart` (土壤温湿度)。
4.  **页面整合**: 组装所有组件到 `src/pages/Mobile/Weather/index.tsx`。
5.  **路由集成**: 更新 `App.tsx` 和 `MobileLayout`。
