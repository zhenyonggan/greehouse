import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal, Form, Select, Input, InputNumber, message, Table, Tag, Tabs } from 'antd';
import { SwapOutlined, CheckSquareOutlined, ScissorOutlined, PlusOutlined } from '@ant-design/icons';
import { inventoryService, OperationRecord, Product } from '../../../services/inventoryService';
import dayjs from 'dayjs';

const { Option } = Select;

const OperationsManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [operationType, setOperationType] = useState<'adjust' | 'transfer' | 'count'>('adjust');
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<OperationRecord[]>([]);

  const fetchProducts = async () => {
    try {
      const res = await inventoryService.getProducts();
      setProducts(res || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getOperationRecords();
      setRecords(res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (isModalVisible) {
      fetchProducts();
    }
  }, [isModalVisible]);

  const handleOpenModal = (type: 'adjust' | 'transfer' | 'count') => {
    setOperationType(type);
    setIsModalVisible(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: OperationRecord = {
        ...values,
        type: operationType,
        transaction_no: `OP${dayjs().format('YYYYMMDDHHmmss')}`,
        status: 'completed',
        transaction_date: dayjs().format('YYYY-MM-DD'),
      };
      
      await inventoryService.createOperationRecord(newRecord);
      message.success('操作成功');
      setIsModalVisible(false);
      form.resetFields();
      fetchRecords();
    } catch (error: any) {
      console.error(error);
      message.error('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const columns = [
    { title: '单号', dataIndex: 'transaction_no', key: 'transaction_no' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type', 
      render: (text: string) => {
        const map: any = { adjust: '库存调整', transfer: '库存调拨', count: '库存盘点' };
        let color = 'blue';
        if (text === 'adjust') color = 'gold';
        if (text === 'count') color = 'green';
        return <Tag color={color}>{map[text] || text}</Tag>;
      } 
    },
    { 
        title: '子类型/原因', 
        dataIndex: 'subtype', 
        key: 'subtype',
        render: (text: string) => {
             const map: any = { loss: '盘亏', overflow: '盘盈', damage: '报损', expired: '过期', other: '其他' };
             return map[text] || text || '-';
        }
    },
    { 
      title: '货品', 
      dataIndex: ['product', 'name'], 
      key: 'product_name',
      render: (text: string, record: any) => `${text} (${record.product?.code})`
    },
    { 
        title: '变动数量', 
        dataIndex: 'quantity', 
        key: 'quantity', 
        render: (val: number, record: any) => (
            <span style={{ color: val > 0 ? 'green' : (val < 0 ? 'red' : 'black') }}>
                {val > 0 ? '+' : ''}{val} {record.product?.unit}
            </span>
        ) 
    },
    { title: '关联方/目标', dataIndex: 'related_party', key: 'related_party' },
    { title: '经办人', dataIndex: 'operator', key: 'operator' },
    { title: '日期', dataIndex: 'transaction_date', key: 'transaction_date' },
  ];

  const renderModalContent = () => {
    switch (operationType) {
      case 'adjust':
        return (
          <>
            <Form.Item name="subtype" label="调整原因" rules={[{ required: true }]}>
              <Select>
                <Option value="damage">报损</Option>
                <Option value="expired">过期</Option>
                <Option value="loss">盘亏</Option>
                <Option value="overflow">盘盈</Option>
                <Option value="other">其他</Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="调整数量 (正数增加，负数减少)" rules={[{ required: true }]}>
               <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </>
        );
      case 'transfer':
        return (
          <>
             <Form.Item name="subtype" label="调拨类型" initialValue="other" hidden>
                <Input />
             </Form.Item>
            <Form.Item name="related_party" label="调入位置/目标仓库" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="quantity" label="调拨数量" rules={[{ required: true }]}>
               <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </>
        );
      case 'count':
        return (
            <>
             <Form.Item name="subtype" label="盘点结果" rules={[{ required: true }]}>
              <Select>
                <Option value="overflow">盘盈</Option>
                <Option value="loss">盘亏</Option>
                <Option value="other">账实相符</Option>
              </Select>
            </Form.Item>
            <Form.Item name="quantity" label="差异数量 (正数盘盈，负数盘亏)" rules={[{ required: true }]}>
               <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Row gutter={16} className="mb-8">
        <Col span={8}>
          <Card hoverable className="cursor-pointer" onClick={() => handleOpenModal('transfer')}>
            <div className="flex items-center gap-4">
               <div className="p-4 bg-blue-50 rounded-full">
                  <SwapOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
               </div>
               <div>
                  <h3 className="text-lg font-bold">库存调拨</h3>
                  <p className="text-gray-500">仓库/库位之间的货品移动</p>
               </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable className="cursor-pointer" onClick={() => handleOpenModal('count')}>
             <div className="flex items-center gap-4">
               <div className="p-4 bg-green-50 rounded-full">
                  <CheckSquareOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
               </div>
               <div>
                  <h3 className="text-lg font-bold">库存盘点</h3>
                  <p className="text-gray-500">定期核对库存实物与账面数量</p>
               </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable className="cursor-pointer" onClick={() => handleOpenModal('adjust')}>
             <div className="flex items-center gap-4">
               <div className="p-4 bg-orange-50 rounded-full">
                  <ScissorOutlined style={{ fontSize: '32px', color: '#faad14' }} />
               </div>
               <div>
                  <h3 className="text-lg font-bold">库存调整</h3>
                  <p className="text-gray-500">损益、报废等特殊情况调整</p>
               </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="操作记录">
        <Table 
            columns={columns} 
            dataSource={records} 
            rowKey="id"
            loading={loading}
        />
      </Card>

      <Modal
        title={
            operationType === 'adjust' ? '新建库存调整' : 
            operationType === 'transfer' ? '新建库存调拨' : '新建库存盘点'
        }
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_id" label="选择货品" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="children">
              {products.map(p => (
                <Option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.spec}</Option>
              ))}
            </Select>
          </Form.Item>

          {renderModalContent()}

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

export default OperationsManagement;
