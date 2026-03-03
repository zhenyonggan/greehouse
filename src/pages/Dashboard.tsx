import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Typography, Space, Tag } from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  ExperimentOutlined, 
  CalendarOutlined,
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { greenhouseService } from '../services/greenhouseService';
import { cropService } from '../services/cropService';
import { userService } from '../services/userService';
import { farmingService } from '../services/farmingService';
import { inventoryService } from '../services/inventoryService';

const { Title, Text } = Typography;

interface DashboardStats {
  greenhouseCount: number;
  cropCount: number;
  userCount: number;
  weeklyTaskCount: number;
  monthlyTaskData: { date: string; count: number }[];
  inventory: {
    totalStock: number;
    monthlyInbound: number;
    monthlyOutbound: number;
    lowStockCount: number;
    distribution: { name: string; value: number }[];
    trend: { dates: string[], inbound: number[], outbound: number[] };
  };
}

const Dashboard: React.FC = () => {
  const { user, roles } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    greenhouseCount: 0,
    cropCount: 0,
    userCount: 0,
    weeklyTaskCount: 0,
    monthlyTaskData: [],
    inventory: {
      totalStock: 0,
      monthlyInbound: 0,
      monthlyOutbound: 0,
      lowStockCount: 0,
      distribution: [],
      trend: { dates: [], inbound: [], outbound: [] }
    }
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1. Get basic counts
        const [
          ghRes,
          cpRes,
          usRes,
          stockRes,
          transRes
        ] = await Promise.all([
          greenhouseService.getGreenhouses({ limit: 1 }).catch(() => ({ count: 0 })),
          cropService.getCrops({ limit: 1 }).catch(() => ({ count: 0 })),
          userService.getUsers({ limit: 1 }).catch(() => ({ count: 0 })),
          inventoryService.getStockLevels().catch(() => null),
          inventoryService.getAllTransactions().catch(() => null)
        ]);

        const ghCount = ghRes.count || 0;
        const cpCount = cpRes.count || 0;
        const usCount = usRes.count || 0;
        const stockLevels = stockRes || [];
        const transactions = transRes || [];

        // 2. Process Farming Tasks
        const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
        const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
        const { count: wkTaskCount } = await farmingService.getTasksByDateRange(startOfWeek, endOfWeek);

        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
        const { data: monthlyTasks } = await farmingService.getTasksByDateRange(startOfMonth, endOfMonth);

        const dailyCounts: Record<string, number> = {};
        const daysInMonth = dayjs().daysInMonth();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = dayjs().date(i).format('YYYY-MM-DD');
          dailyCounts[date] = 0;
        }
        if (monthlyTasks) {
          monthlyTasks.forEach((task: any) => {
            const date = dayjs(task.planned_date).format('YYYY-MM-DD');
            if (dailyCounts[date] !== undefined) dailyCounts[date]++;
          });
        }
        const monthlyTaskData = Object.keys(dailyCounts).sort().map(date => ({
          date: dayjs(date).format('MM-DD'),
          count: dailyCounts[date]
        }));

        // 3. Process Inventory Data
        let totalStock = 0;
        let lowStockCount = 0;
        const categoryMap = new Map();
        
        if (stockLevels) {
          stockLevels.forEach((item: any) => {
            totalStock += item.quantity;
            if (item.quantity <= (item.product?.min_stock || 10)) lowStockCount++;
            const category = item.product?.category || '未分类';
            categoryMap.set(category, (categoryMap.get(category) || 0) + item.quantity);
          });
        }

        const currentMonth = dayjs().format('YYYY-MM');
        let monthlyInbound = 0;
        let monthlyOutbound = 0;
        const dates = [];
        const inboundCounts = [];
        const outboundCounts = [];

        if (transactions) {
          transactions.forEach((t: any) => {
            if (dayjs(t.transaction_date).format('YYYY-MM') === currentMonth) {
              if (t.type === 'inbound') monthlyInbound++;
              if (t.type === 'outbound') monthlyOutbound++;
            }
          });

          for (let i = 6; i >= 0; i--) {
            const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
            dates.push(dayjs(date).format('MM-DD'));
            const dayTrans = transactions.filter((t: any) => dayjs(t.transaction_date).format('YYYY-MM-DD') === date);
            let inC = 0, outC = 0;
            dayTrans.forEach((t: any) => {
              if (t.type === 'inbound') inC++;
              if (t.type === 'outbound') outC++;
            });
            inboundCounts.push(inC);
            outboundCounts.push(outC);
          }
        }

        setStats({
          greenhouseCount: ghCount || 0,
          cropCount: cpCount || 0,
          userCount: usCount || 0,
          weeklyTaskCount: wkTaskCount || 0,
          monthlyTaskData,
          inventory: {
            totalStock,
            monthlyInbound,
            monthlyOutbound,
            lowStockCount,
            distribution: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
            trend: { dates, inbound: inboundCounts, outbound: outboundCounts }
          }
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getTaskChartOption = () => ({
    title: { text: '本月农事任务统计', textStyle: { color: '#333', fontSize: 14, fontWeight: 'bold' }, left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: stats.monthlyTaskData.map(d => d.date), axisTick: { alignWithLabel: true } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [{
      name: '任务数量', type: 'bar', barWidth: '60%',
      data: stats.monthlyTaskData.map(d => d.count),
      itemStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#69c0ff' }] },
        borderRadius: [4, 4, 0, 0]
      }
    }]
  });

  const getInventoryDistOption = () => ({
    title: { text: '库存分类占比', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', textStyle: { fontSize: 10 } },
    series: [{
      name: '库存量', type: 'pie', radius: ['40%', '70%'],
      data: stats.inventory.distribution,
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  });

  const getInventoryTrendOption = () => ({
    title: { text: '近7天出入库单量', left: 'center', textStyle: { fontSize: 14, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: stats.inventory.trend.dates },
    yAxis: { type: 'value' },
    series: [
      { name: '入库', data: stats.inventory.trend.inbound, type: 'line', smooth: true, itemStyle: { color: '#52c41a' } },
      { name: '出库', data: stats.inventory.trend.outbound, type: 'line', smooth: true, itemStyle: { color: '#1890ff' } }
    ]
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><Spin size="large" tip="智慧引擎启动中..." /></div>;
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">数字工作台</h1>
            <p className="text-gray-500 mt-1">
              <Space>
                <Tag color="blue">{user?.full_name || user?.email}</Tag>
                <Tag color="green">{roles.join(', ')}</Tag>
                <Text type="secondary">智慧大棚生产监控系统</Text>
              </Space>
            </p>
          </div>
          <div className="text-right">
              <div className="text-lg font-mono text-blue-600 font-bold">{dayjs().format('HH:mm:ss')}</div>
              <div className="text-gray-400 text-xs">{dayjs().format('YYYY年MM月DD日 dddd')}</div>
          </div>
      </div>

      <Row gutter={[20, 20]}>
        {/* 第一行：基础统计卡片 */}
        {[
          { title: '大棚设施', val: stats.greenhouseCount, unit: '个', icon: <ShopOutlined />, color: 'bg-green-500', sub: '实时监控中' },
          { title: '作物种类', val: stats.cropCount, unit: '种', icon: <ExperimentOutlined />, color: 'bg-orange-500', sub: '生长状态良好' },
          { title: '总库存量', val: stats.inventory.totalStock, unit: '件', icon: <InboxOutlined />, color: 'bg-blue-600', sub: '仓库物资储备' },
          { title: '库存预警', val: stats.inventory.lowStockCount, unit: '项', icon: <PieChartOutlined />, color: 'bg-red-500', sub: '需及时补货', valColor: 'text-red-500' },
        ].map((item, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card bordered={false} className="shadow-sm hover:shadow-lg transition-all rounded-xl border-l-4 border-opacity-70" style={{ borderLeftColor: item.color.replace('bg-', '') }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 mb-1 text-sm font-medium">{item.title}</p>
                  <div className={`text-3xl font-bold ${item.valColor || 'text-gray-800'}`}>{item.val}<span className="text-sm ml-1 font-normal text-gray-400">{item.unit}</span></div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center text-white text-2xl shadow-lg shadow-opacity-20`}>
                  {item.icon}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
                <span>{item.sub}</span>
                <span className="text-blue-500 cursor-pointer hover:underline">查看详情</span>
              </div>
            </Card>
          </Col>
        ))}

        {/* 第二行：业务动态卡片 */}
        <Col xs={24} lg={12}>
          <Row gutter={[20, 20]}>
            <Col span={12}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic title="本月入库单" value={stats.inventory.monthlyInbound} prefix={<UploadOutlined />} valueStyle={{ color: '#52c41a' }} suffix="单" />
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                <Statistic title="本月出库单" value={stats.inventory.monthlyOutbound} prefix={<DownloadOutlined />} valueStyle={{ color: '#1890ff' }} suffix="单" />
              </Card>
            </Col>
            <Col span={24}>
              <Card bordered={false} className="shadow-sm rounded-xl h-full">
                 <div className="flex items-center justify-between mb-4">
                   <Text strong><CalendarOutlined className="mr-2" />本周农事计划</Text>
                   <Tag color="purple">{stats.weeklyTaskCount} 项待办</Tag>
                 </div>
                 <div className="text-center py-4 bg-purple-50 rounded-lg border border-purple-100">
                    <Text type="secondary">计划执行率</Text>
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                 </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* 第二行右侧：任务趋势图 */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden h-full">
            <ReactECharts option={getTaskChartOption()} style={{ height: '240px' }} />
          </Card>
        </Col>

        {/* 第三行：库存专业图表 */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
            <ReactECharts option={getInventoryDistOption()} style={{ height: '300px' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
            <ReactECharts option={getInventoryTrendOption()} style={{ height: '300px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
