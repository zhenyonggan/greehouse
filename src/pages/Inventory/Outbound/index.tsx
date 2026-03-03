import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Tag, Space, DatePicker, Modal, Form, Select, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { inventoryService, OutboundRecord, Product } from '../../../services/inventoryService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OutboundManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OutboundRecord[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await inventoryService.getProducts();
      setProducts(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let subtype;
      switch (activeTab) {
        case '2': subtype = 'sales'; break;
        case '3': subtype = 'picking'; break;
        case '4': subtype = 'other'; break;
        default: subtype = undefined;
      }
      
      const records = await inventoryService.getOutboundRecords(subtype);
      setData(records || []);
    } catch (error) {
      console.error(error);
      message.error('获取出库记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (isModalVisible) {
      fetchProducts();
    }
  }, [isModalVisible]);

  const columns = [
    { title: '出库单号', dataIndex: 'transaction_no', key: 'transaction_no' },
    { 
      title: '出库类型', 
      dataIndex: 'subtype', 
      key: 'subtype', 
      render: (text: string) => {
        const map: any = { sales: '销售出库', picking: '领料出库', other: '其他出库' };
        return <Tag color="orange">{map[text] || text}</Tag>;
      } 
    },
    { 
      title: '货品', 
      dataIndex: ['product', 'name'], 
      key: 'product_name',
      render: (text: string, record: any) => `${text} (${record.product?.code})`
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (val: number, record: any) => `${val} ${record.product?.unit}` },
    { title: '客户/去向', dataIndex: 'related_party', key: 'related_party' },
    { title: '出库日期', dataIndex: 'transaction_date', key: 'transaction_date' },
    { title: '经办人', dataIndex: 'operator', key: 'operator' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color={text === 'completed' ? 'green' : 'orange'}>{text === 'completed' ? '已完成' : '待处理'}</Tag> },
    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: OutboundRecord = {
        ...values,
        transaction_no: `OUT${dayjs().format('YYYYMMDDHHmmss')}`,
        type: 'outbound',
        status: 'completed', // Simplified: auto-complete
        transaction_date: dayjs().format('YYYY-MM-DD'),
      };
      
      await inventoryService.createOutboundRecord(newRecord);
      message.success('出库单创建成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error: any) {
      console.error(error);
      message.error('创建失败: ' + (error.message || '未知错误'));
    }
  };

  const renderContent = () => (
    <div>
      <div className="flex justify-between mb-4">
        <Space>
          <RangePicker />
          <Button type="primary" onClick={fetchData}>查询</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>新建出库单</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />
    </div>
  );

  const items = [
    { key: '1', label: '全部出库', children: renderContent() },
    { key: '2', label: '销售出库', children: renderContent() },
    { key: '3', label: '领料出库', children: renderContent() },
    { key: '4', label: '其他出库', children: renderContent() },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Tabs defaultActiveKey="1" items={items} onChange={setActiveTab} />

      <Modal
        title="新建出库单"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subtype" label="出库类型" rules={[{ required: true }]}>
            <Select>
              <Option value="sales">销售出库</Option>
              <Option value="picking">领料出库</Option>
              <Option value="other">其他出库</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="product_id" label="选择货品" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {products.map(p => (
                <Option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.spec}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="quantity" label="出库数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="related_party" label="客户/去向" rules={[{ required: true }]}>
            <Input placeholder="客户名称或大棚名称" />
          </Form.Item>

          <Form.Item name="operator" label="经办人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OutboundManagement;
