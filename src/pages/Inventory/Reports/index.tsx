import React, { useState, useEffect } from 'react';
import { Tabs, Table, Tag, Input, Button, Space, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { inventoryService } from '../../../services/inventoryService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ReportsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [stockData, setStockData] = useState<any[]>([]);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getStockLevels();
      const formatted = res?.map((item: any) => ({
        key: item.id,
        warehouse: '主仓库', // Simplified for now
        code: item.product?.code,
        name: item.product?.name,
        category: item.product?.category,
        spec: item.product?.spec,
        unit: item.product?.unit,
        quantity: item.quantity,
      }));
      setStockData(formatted || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAllTransactions();
      const formatted = res?.map((item: any) => {
        let inQty = 0;
        let outQty = 0;
        
        // Simplified logic: adjust type might be in or out
        if (item.type === 'inbound') inQty = item.quantity;
        if (item.type === 'outbound') outQty = item.quantity;
        if (item.type === 'adjust' && item.quantity > 0) inQty = item.quantity;
        if (item.type === 'adjust' && item.quantity < 0) outQty = Math.abs(item.quantity);
        if (item.type === 'count' && item.quantity > 0) inQty = item.quantity;
        if (item.type === 'count' && item.quantity < 0) outQty = Math.abs(item.quantity);

        return {
          key: item.id,
          date: item.transaction_date,
          type: item.type,
          subtype: item.subtype,
          id: item.transaction_no,
          product_name: item.product?.name,
          inQty,
          outQty,
        };
      });
      setLedgerData(formatted || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Get all transactions
      const transactions = await inventoryService.getAllTransactions();
      const products = await inventoryService.getProducts();
      
      if (!transactions || !products) return;

      const summaryMap = new Map();

      // Initialize map with all products
      products.forEach((p: any) => {
        summaryMap.set(p.id, {
            key: p.id,
            code: p.code,
            name: p.name,
            spec: p.spec,
            unit: p.unit,
            startStock: 0, // In a real system, this would be calculated based on date range
            inQty: 0,
            outQty: 0,
            endStock: 0,
        });
      });

      // Aggregate transactions
      transactions.forEach((t: any) => {
        const item = summaryMap.get(t.product_id);
        if (item) {
             let inQ = 0;
             let outQ = 0;
             if (t.type === 'inbound') inQ = t.quantity;
             if (t.type === 'outbound') outQ = t.quantity;
             if (t.type === 'adjust' && t.quantity > 0) inQ = t.quantity;
             if (t.type === 'adjust' && t.quantity < 0) outQ = Math.abs(t.quantity);
             if (t.type === 'count' && t.quantity > 0) inQ = t.quantity;
             if (t.type === 'count' && t.quantity < 0) outQ = Math.abs(t.quantity);

             item.inQty += inQ;
             item.outQty += outQ;
        }
      });

      // Calculate end stock (Simplified: assuming start stock is 0 for this demo)
      // In real app: End = Start + In - Out
      // Here we just use the current stock from aggregation or fetch real stock
      // Let's use the aggregation for consistency with the period
      const summaryList = Array.from(summaryMap.values()).map(item => ({
          ...item,
          endStock: item.startStock + item.inQty - item.outQty
      }));

      setSummaryData(summaryList);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === '1') fetchStockData();
    if (activeTab === '2') fetchLedgerData();
    if (activeTab === '3') fetchSummaryData();
  }, [activeTab]);

  const stockColumns = [
    { title: '仓库', dataIndex: 'warehouse', key: 'warehouse' },
    { title: '货品编码', dataIndex: 'code', key: 'code' },
    { title: '货品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { 
      title: '库存数量', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      sorter: (a: any, b: any) => a.quantity - b.quantity,
      render: (text: number) => (
        <span className={text <= 10 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
          {text}
        </span>
      )
    },
  ];

  const ledgerColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { 
        title: '单据类型', 
        dataIndex: 'type', 
        key: 'type',
        render: (text: string, record: any) => {
            const map: any = { inbound: '入库', outbound: '出库', adjust: '调整', transfer: '调拨', count: '盘点' };
            let color = 'blue';
            if (text === 'outbound') color = 'orange';
            if (text === 'adjust') color = 'gold';
            return <Tag color={color}>{map[text] || text} - {record.subtype}</Tag>;
        }
    },
    { title: '单号', dataIndex: 'id', key: 'id' },
    { title: '货品', dataIndex: 'product_name', key: 'product_name' },
    { title: '入库数量', dataIndex: 'inQty', key: 'inQty', render: (text: number) => text > 0 ? <span className="text-green-600">+{text}</span> : '-' },
    { title: '出库数量', dataIndex: 'outQty', key: 'outQty', render: (text: number) => text > 0 ? <span className="text-red-600">-{text}</span> : '-' },
  ];

  const summaryColumns = [
    { title: '货品编码', dataIndex: 'code', key: 'code' },
    { title: '货品名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { title: '期初库存', dataIndex: 'startStock', key: 'startStock' },
    { title: '本期入库', dataIndex: 'inQty', key: 'inQty', className: 'text-green-600' },
    { title: '本期出库', dataIndex: 'outQty', key: 'outQty', className: 'text-red-600' },
    { title: '期末库存', dataIndex: 'endStock', key: 'endStock', className: 'font-bold' },
  ];

  const filteredStockData = stockData.filter(item => 
    !searchText || 
    item.name?.includes(searchText) || 
    item.code?.includes(searchText)
  );

  const items = [
    {
      key: '1',
      label: '实时库存',
      children: (
        <div>
           <div className="flex justify-between mb-4">
            <Space>
              <Input 
                placeholder="搜索货品名称或编码" 
                prefix={<SearchOutlined />} 
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Button type="primary" onClick={fetchStockData}>刷新</Button>
            </Space>
          </div>
          <Table 
            columns={stockColumns} 
            dataSource={filteredStockData} 
            loading={loading}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: '库存台账',
      children: <Table columns={ledgerColumns} dataSource={ledgerData} loading={loading} />,
    },
    {
      key: '3',
      label: '收发存汇总',
      children: (
        <div>
           <div className="flex justify-between mb-4">
            <Space>
              <RangePicker />
              <Button type="primary" onClick={fetchSummaryData}>查询</Button>
            </Space>
          </div>
          <Table 
            columns={summaryColumns} 
            dataSource={summaryData} 
            loading={loading} 
            summary={pageData => {
                let totalIn = 0;
                let totalOut = 0;
        
                pageData.forEach(({ inQty, outQty }) => {
                    totalIn += inQty;
                    totalOut += outQty;
                });
        
                return (
                    <Table.Summary fixed>
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={5}>总计</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                            <span className="text-green-600 font-bold">{totalIn}</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                             <span className="text-red-600 font-bold">{totalOut}</span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} />
                    </Table.Summary.Row>
                    </Table.Summary>
                );
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Tabs defaultActiveKey="1" items={items} onChange={setActiveTab} />
    </div>
  );
};

export default ReportsManagement;
