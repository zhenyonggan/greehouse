import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Spin } from 'antd';
import { PieChartOutlined, InboxOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { inventoryService } from '../../../services/inventoryService';
import dayjs from 'dayjs';

const { Title } = Typography;

const InventoryDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStock: 0,
    monthlyInbound: 0,
    monthlyOutbound: 0,
    lowStockCount: 0,
  });
  const [stockDistribution, setStockDistribution] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<{ dates: string[], inbound: number[], outbound: number[] }>({
    dates: [],
    inbound: [],
    outbound: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [stockLevels, transactions] = await Promise.all([
          inventoryService.getStockLevels(),
          inventoryService.getAllTransactions()
        ]);

        if (!stockLevels || !transactions) return;

        // 1. Calculate Statistics
        let totalStock = 0;
        let lowStockCount = 0;
        stockLevels.forEach((item: any) => {
          totalStock += item.quantity;
          if (item.quantity <= (item.product?.min_stock || 10)) {
            lowStockCount++;
          }
        });

        const currentMonth = dayjs().format('YYYY-MM');
        let monthlyInbound = 0;
        let monthlyOutbound = 0;

        // 2. Process Recent Activities & Monthly Stats
        const recent = transactions.slice(0, 5).map((t: any) => ({
          key: t.id,
          type: t.type,
          subtype: t.subtype,
          product: t.product?.name,
          quantity: t.quantity,
          operator: t.operator,
          time: dayjs(t.created_at).format('YYYY-MM-DD HH:mm'),
        }));
        setRecentActivities(recent);

        // 3. Process Stock Distribution (by Category)
        const categoryMap = new Map();
        stockLevels.forEach((item: any) => {
          const category = item.product?.category || 'Uncategorized';
          categoryMap.set(category, (categoryMap.get(category) || 0) + item.quantity);
        });
        const distData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
        setStockDistribution(distData);

        // 4. Process Trend Data (Last 7 days)
        const dates = [];
        const inboundCounts = [];
        const outboundCounts = [];
        for (let i = 6; i >= 0; i--) {
          const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
          dates.push(date);
          
          // Filter transactions for this date
          const dayTrans = transactions.filter((t: any) => 
            dayjs(t.transaction_date).format('YYYY-MM-DD') === date
          );

          let inCount = 0;
          let outCount = 0;
          dayTrans.forEach((t: any) => {
             if (t.type === 'inbound') inCount++;
             if (t.type === 'outbound') outCount++;
          });
          inboundCounts.push(inCount);
          outboundCounts.push(outCount);
        }
        setTrendData({ dates, inbound: inboundCounts, outbound: outboundCounts });

        // Calculate Monthly Stats
        transactions.forEach((t: any) => {
            if (dayjs(t.transaction_date).format('YYYY-MM') === currentMonth) {
                if (t.type === 'inbound') monthlyInbound++;
                if (t.type === 'outbound') monthlyOutbound++;
            }
        });

        setStats({
          totalStock,
          monthlyInbound,
          monthlyOutbound,
          lowStockCount,
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stockOptions = {
    title: {
      text: '库存分类占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Inventory',
        type: 'pie',
        radius: '50%',
        data: stockDistribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const trendOptions = {
    title: {
      text: '近7天出入库单量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: trendData.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库单',
        data: trendData.inbound,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '出库单',
        data: trendData.outbound,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#1890ff' }
      }
    ]
  };

  const columns = [
    {
      title: '操作类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        let color = 'geekblue';
        let label = text;
        if (text === 'inbound') { color = 'green'; label = '入库'; }
        if (text === 'outbound') { color = 'volcano'; label = '出库'; }
        if (text === 'adjust') { color = 'gold'; label = '调整'; }
        if (text === 'transfer') { color = 'blue'; label = '调拨'; }
        if (text === 'count') { color = 'cyan'; label = '盘点'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '货品名称',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (val: number) => Math.abs(val)
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full p-20"><Spin size="large" /></div>;
  }

  return (
    <div className="p-6">
      <Title level={2} className="mb-6">库存概览</Title>
      
      <Row gutter={16} className="mb-8">
        <Col span={6}>
          <Card>
            <Statistic
              title="总库存量"
              value={stats.totalStock}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<InboxOutlined />}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月入库"
              value={stats.monthlyInbound}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<UploadOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月出库"
              value={stats.monthlyOutbound}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DownloadOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存预警"
              value={stats.lowStockCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<PieChartOutlined />}
              suffix="项"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="mb-8">
        <Col span={12}>
          <Card title="库存分布" bordered={false}>
            {stockDistribution.length > 0 ? (
                <ReactECharts option={stockOptions} />
            ) : (
                <div className="text-center py-10 text-gray-400">暂无库存数据</div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="近7天出入库趋势" bordered={false}>
            <ReactECharts option={trendOptions} />
          </Card>
        </Col>
      </Row>

      <Card title="最近库存变动" bordered={false}>
        <Table columns={columns} dataSource={recentActivities} pagination={false} />
      </Card>
    </div>
  );
};

export default InventoryDashboard;
