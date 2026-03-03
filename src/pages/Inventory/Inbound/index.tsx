import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Tag, Space, DatePicker, Modal, Form, Select, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { inventoryService, InboundRecord, Product } from '../../../services/inventoryService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const InboundManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InboundRecord[]>([]);
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
        case '2': subtype = 'purchase'; break;
        case '3': subtype = 'production'; break;
        case '4': subtype = 'other'; break;
        default: subtype = undefined;
      }
      
      const records = await inventoryService.getInboundRecords(subtype);
      setData(records || []);
    } catch (error) {
      console.error(error);
      message.error('获取入库记录失败');
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
    { title: '入库单号', dataIndex: 'transaction_no', key: 'transaction_no' },
    { 
      title: '入库类型', 
      dataIndex: 'subtype', 
      key: 'subtype', 
      render: (text: string) => {
        const map: any = { purchase: '采购入库', production: '生产入库', other: '其他入库' };
        return <Tag color="blue">{map[text] || text}</Tag>;
      } 
    },
    { 
      title: '货品', 
      dataIndex: ['product', 'name'], 
      key: 'product_name',
      render: (text: string, record: any) => `${text} (${record.product?.code})`
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (val: number, record: any) => `${val} ${record.product?.unit}` },
    { title: '供应商/来源', dataIndex: 'related_party', key: 'related_party' },
    { title: '入库日期', dataIndex: 'transaction_date', key: 'transaction_date' },
    { title: '经办人', dataIndex: 'operator', key: 'operator' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (text: string) => <Tag color={text === 'completed' ? 'green' : 'orange'}>{text === 'completed' ? '已完成' : '待处理'}</Tag> },
    { title: '备注', dataIndex: 'remarks', key: 'remarks' },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: InboundRecord = {
        ...values,
        transaction_no: `IN${dayjs().format('YYYYMMDDHHmmss')}`,
        type: 'inbound',
        status: 'completed', // Simplified: auto-complete
        transaction_date: dayjs().format('YYYY-MM-DD'),
      };
      
      await inventoryService.createInboundRecord(newRecord);
      message.success('入库单创建成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('创建失败');
    }
  };

  const renderContent = () => (
    <div>
      <div className="flex justify-between mb-4">
        <Space>
          <RangePicker />
          <Button type="primary" onClick={fetchData}>查询</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>新建入库单</Button>
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
    { key: '1', label: '全部入库', children: renderContent() },
    { key: '2', label: '采购入库', children: renderContent() },
    { key: '3', label: '生产入库', children: renderContent() },
    { key: '4', label: '其他入库', children: renderContent() },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <Tabs defaultActiveKey="1" items={items} onChange={setActiveTab} />

      <Modal
        title="新建入库单"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="subtype" label="入库类型" rules={[{ required: true }]}>
            <Select>
              <Option value="purchase">采购入库</Option>
              <Option value="production">生产入库</Option>
              <Option value="other">其他入库</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="product_id" label="选择货品" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {products.map(p => (
                <Option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.spec}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="quantity" label="入库数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="related_party" label="供应商/来源" rules={[{ required: true }]}>
            <Input placeholder="采购来源或生产大棚名称" />
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

export default InboundManagement;
