# Smart Greenhouse Management System (智慧大棚管理系统)

A comprehensive, AI-powered web application for managing smart greenhouse operations. This system enables agricultural businesses to monitor facilities, manage crops, plan farming tasks, and track personnel efficiently.

## 🌟 Key Features

### 1. **Dashboard (工作台)**
- Real-time overview of all greenhouse facilities.
- Statistics on crop varieties and active personnel.
- Weekly and monthly farming task summaries with interactive charts.
- Modern, tech-inspired UI design.

### 2. **Greenhouse Management (大棚管理)**
- Detailed list and status tracking of all greenhouse units.
- Deep dive into individual greenhouse details:
  - Basic information (area, location, type).
  - Current crop batches.
  - Specific farming tasks and calendar view.

### 3. **Crop Management (作物管理)**
- Database of crop types with growth cycle information.
- Batch tracking from planting to harvest.

### 4. **Farming Plans & Records (农事计划与记录)**
- **Planning**: Schedule tasks (watering, fertilizing, harvesting) for specific greenhouses and workers.
- **Calendar View**: Visual representation of tasks on a monthly calendar.
- **Execution**: Workers can log actual execution details, including time and notes.

### 5. **Personnel Management (人员管理)**
- Role-based access control (Admin, Manager, Technician, Worker).
- Staff directory with department and skill tracking.

### 6. **Reports (数据报表)**
- Visual analytics for productivity and resource usage.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Ant Design (v5), Tailwind CSS
- **Charts**: ECharts (echarts-for-react)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Backend / Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zhenyonggan/greehouse.git
   cd greehouse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 to view it in the browser.

## 📂 Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
├── layouts/         # Page layouts (MainLayout, AuthLayout)
├── pages/           # Application pages
│   ├── Dashboard.tsx
│   ├── Greenhouses/
│   ├── Crops/
│   ├── FarmingPlans/
│   ├── FarmingRecords/
│   ├── Personnel/
│   └── ...
├── services/        # API service layer (Supabase interactions)
├── store/           # Global state management (Zustand)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🤝 Contribution

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---
*Built with ❤️ for Modern Agriculture.*
