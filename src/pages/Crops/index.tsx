
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, message, Card, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { cropService } from '../../services/cropService';
import { Crop } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const Crops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const { data, error } = await cropService.getCrops({ search, category: categoryFilter });
      if (error) {
        message.error('获取作物列表失败');
      } else {
        setCrops(data as Crop[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [search, categoryFilter]);

  const handleAdd = () => {
    setEditingCrop(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Crop) => {
    setEditingCrop(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该作物吗？',
      onOk: async () => {
        const { error } = await cropService.deleteCrop(id);
        if (error) {
          message.error('删除失败');
        } else {
          message.success('删除成功');
          fetchCrops();
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      let result;
      if (editingCrop) {
        result = await cropService.updateCrop(editingCrop.id, values);
      } else {
        result = await cropService.createCrop(values);
      }

      if (result.error) {
        message.error(result.error.message);
      } else {
        message.success(editingCrop ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchCrops();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '作物名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '品种',
      dataIndex: 'variety',
      key: 'variety',
    },
    {
      title: '生长周期(天)',
      dataIndex: 'growth_period_days',
      key: 'growth_period_days',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Crop) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="link" danger />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">作物管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加作物
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索作物名称"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="筛选类别"
            allowClear
            onChange={(value) => setCategoryFilter(value)}
            className="w-48"
          >
            <Option value="蔬菜">蔬菜</Option>
            <Option value="水果">水果</Option>
            <Option value="花卉">花卉</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={crops}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCrop ? '编辑作物' : '添加作物'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="作物名称"
            rules={[{ required: true, message: '请输入作物名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="类别"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Select>
              <Option value="蔬菜">蔬菜</Option>
              <Option value="水果">水果</Option>
              <Option value="花卉">花卉</Option>
              <Option value="粮食">粮食</Option>
            </Select>
          </Form.Item>
          <Form.Item name="variety" label="品种">
            <Input />
          </Form.Item>
          <Form.Item name="growth_period_days" label="生长周期(天)">
            <InputNumber className="w-full" min={1} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={4} />
          </Form.Item>
           <Form.Item name="planting_guide" label="种植指南">
            <TextArea rows={4} />
          </Form.Item>
          {/* Growth stages could be a more complex dynamic form list */}
        </Form>
      </Modal>
    </div>
  );
};

export default Crops;
