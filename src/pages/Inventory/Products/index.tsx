import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Modal, Form, Select, message, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { inventoryService, Product } from '../../../services/inventoryService';

const { Option } = Select;

const ProductManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Product[]>([]);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const products = await inventoryService.getProducts();
      setData(products || []);
    } catch (error) {
      console.error(error);
      message.error('获取货品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: '编码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '规格', dataIndex: 'spec', key: 'spec' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    { title: '最低库存', dataIndex: 'min_stock', key: 'min_stock' },
    { title: '最高库存', dataIndex: 'max_stock', key: 'max_stock' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id!)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setEditingId(record.id!);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个货品吗？',
      onOk: async () => {
        try {
          await inventoryService.deleteProduct(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleOk = () => {
    form.validateFields().then(async values => {
      try {
        if (editingId) {
          await inventoryService.updateProduct(editingId, values);
          message.success('更新成功');
        } else {
          await inventoryService.createProduct(values);
          message.success('添加成功');
        }
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      } catch (error: any) {
        console.error(error);
        message.error('操作失败: ' + (error.message || '未知错误'));
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <Space>
          <Input placeholder="输入名称或编码搜索" prefix={<SearchOutlined />} />
          <Button type="primary">搜索</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增货品
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
      />

      <Modal 
        title={editingId ? "编辑货品" : "新增货品"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select>
              <Option value="种子">种子</Option>
              <Option value="化肥">化肥</Option>
              <Option value="农药">农药</Option>
              <Option value="工具">工具</Option>
              <Option value="包装材料">包装材料</Option>
            </Select>
          </Form.Item>
          <Form.Item name="spec" label="规格">
            <Input />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true, message: '请输入单位' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="min_stock" label="最低库存">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="max_stock" label="最高库存">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;
