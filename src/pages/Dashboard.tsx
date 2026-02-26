
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, ShopOutlined, ExperimentOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { greenhouseService } from '../services/greenhouseService';
import { cropService } from '../services/cropService';
import { userService } from '../services/userService';
import { farmingService } from '../services/farmingService';

interface DashboardStats {
  greenhouseCount: number;
  cropCount: number;
  userCount: number;
  weeklyTaskCount: number;
  monthlyTaskData: { date: string; count: number }[];
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
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // 1. Get counts
        const { count: ghCount } = await greenhouseService.getGreenhouses({ limit: 1 });
        const { count: cpCount } = await cropService.getCrops({ limit: 1 });
        const { count: usCount } = await userService.getUsers({ limit: 1 });

        // 2. Get weekly tasks
        const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
        const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
        const { count: wkTaskCount } = await farmingService.getTasksByDateRange(startOfWeek, endOfWeek);

        // 3. Get monthly tasks for chart
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
        const { data: monthlyTasks } = await farmingService.getTasksByDateRange(startOfMonth, endOfMonth);

        // Process monthly tasks into daily counts
        const dailyCounts: Record<string, number> = {};
        // Initialize all days in month with 0
        const daysInMonth = dayjs().daysInMonth();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = dayjs().date(i).format('YYYY-MM-DD');
          dailyCounts[date] = 0;
        }

        if (monthlyTasks) {
          monthlyTasks.forEach((task: any) => {
            const date = dayjs(task.planned_date).format('YYYY-MM-DD');
            if (dailyCounts[date] !== undefined) {
              dailyCounts[date]++;
            }
          });
        }

        const monthlyTaskData = Object.keys(dailyCounts).sort().map(date => ({
          date: dayjs(date).format('MM-DD'),
          count: dailyCounts[date]
        }));

        setStats({
          greenhouseCount: ghCount || 0,
          cropCount: cpCount || 0,
          userCount: usCount || 0,
          weeklyTaskCount: wkTaskCount || 0,
          monthlyTaskData
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getChartOption = () => {
    return {
      title: {
        text: '本月农事任务统计',
        textStyle: {
            color: '#333',
            fontSize: 16,
            fontWeight: 'normal'
        },
        left: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: stats.monthlyTaskData.map(d => d.date),
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
            lineStyle: {
                color: '#999'
            }
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
            lineStyle: {
                type: 'dashed',
                color: '#eee'
            }
        }
      },
      series: [
        {
          name: '任务数量',
          type: 'bar',
          barWidth: '60%',
          data: stats.monthlyTaskData.map(d => d.count),
          itemStyle: {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: '#1890ff' // 0% 处的颜色
                }, {
                    offset: 1, color: '#69c0ff' // 100% 处的颜色
                }],
                global: false // 缺省为 false
            },
            borderRadius: [4, 4, 0, 0]
          },
          label: {
              show: true,
              position: 'top',
              color: '#666'
          }
        }
      ]
    };
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Spin size="large" tip="加载数据中..." />
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">工作台</h1>
            <p className="text-gray-500 mt-1">欢迎回来, {user?.full_name || user?.email} | {roles.join(', ')}</p>
          </div>
          <div className="text-right text-gray-400 text-sm">
              {dayjs().format('YYYY年MM月DD日 dddd')}
          </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* 大棚数量 */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden h-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 mb-1 text-sm">大棚数量</p>
                    <div className="text-3xl font-bold text-gray-800">{stats.greenhouseCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                    <ShopOutlined />
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
                <span>管理的所有大棚设施</span>
            </div>
          </Card>
        </Col>

        {/* 作物数量 */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden h-full">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 mb-1 text-sm">作物种类</p>
                    <div className="text-3xl font-bold text-gray-800">{stats.cropCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                    <ExperimentOutlined />
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
                <span>当前系统记录的作物类型</span>
            </div>
          </Card>
        </Col>

        {/* 人员总数 */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden h-full">
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 mb-1 text-sm">人员总数</p>
                    <div className="text-3xl font-bold text-gray-800">{stats.userCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                    <UserOutlined />
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
                <span>系统注册的所有账号</span>
            </div>
          </Card>
        </Col>

        {/* 本周任务 */}
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden h-full">
             <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 mb-1 text-sm">本周任务</p>
                    <div className="text-3xl font-bold text-gray-800">{stats.weeklyTaskCount}</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                    <CalendarOutlined />
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400">
                <span>本周计划执行的农事任务</span>
            </div>
          </Card>
        </Col>

        {/* 任务统计图表 */}
        <Col span={24}>
          <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden p-2">
            <ReactECharts option={getChartOption()} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
