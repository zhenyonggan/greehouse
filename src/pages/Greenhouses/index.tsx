
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { greenhouseService } from '../../services/greenhouseService';
import { Greenhouse, User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';

const { Option } = Select;

const Greenhouses: React.FC = () => {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGreenhouse, setEditingGreenhouse] = useState<Greenhouse | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [managers, setManagers] = useState<User[]>([]);
  const navigate = useNavigate();

  const fetchGreenhouses = async () => {
    setLoading(true);
    try {
      const { data, error } = await greenhouseService.getGreenhouses({ search, status: statusFilter });
      if (error) {
        message.error('获取大棚列表失败');
      } else {
        setGreenhouses(data as Greenhouse[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    // Ideally filter by role 'manager'
    const { data } = await userService.getUsers({ limit: 100 });
    if (data) setManagers(data as User[]);
  };

  useEffect(() => {
    fetchGreenhouses();
  }, [search, statusFilter]);

  useEffect(() => {
      fetchManagers();
  }, []);

  const handleAdd = () => {
    setEditingGreenhouse(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Greenhouse) => {
    setEditingGreenhouse(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该大棚吗？',
      onOk: async () => {
        const { error } = await greenhouseService.deleteGreenhouse(id);
        if (error) {
          message.error('删除失败');
        } else {
          message.success('删除成功');
          fetchGreenhouses();
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      let result;
      if (editingGreenhouse) {
        result = await greenhouseService.updateGreenhouse(editingGreenhouse.id, values);
      } else {
        result = await greenhouseService.createGreenhouse(values);
      }

      if (result.error) {
        message.error(result.error.message);
      } else {
        message.success(editingGreenhouse ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchGreenhouses();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '编号',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '面积(㎡)',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: '负责人',
      dataIndex: ['manager', 'full_name'], // Access nested property
      key: 'manager',
      render: (text: string, record: Greenhouse) => (
          // @ts-ignore
          record.manager?.full_name || '未分配'
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = '未知';
        switch (status) {
          case 'active': color = 'green'; text = '正常'; break;
          case 'inactive': color = 'red'; text = '闲置'; break;
          case 'maintenance': color = 'orange'; text = '维护中'; break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Greenhouse) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/greenhouses/${record.id}`)} type="link">详情</Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="link" danger />
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">大棚管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加大棚
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索编号或名称"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="筛选状态"
            allowClear
            onChange={(value) => setStatusFilter(value)}
            className="w-48"
          >
            <Option value="active">正常</Option>
            <Option value="inactive">闲置</Option>
            <Option value="maintenance">维护中</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={greenhouses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingGreenhouse ? '编辑大棚' : '添加大棚'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="大棚编号"
            rules={[{ required: true, message: '请输入编号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="大棚名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input />
          </Form.Item>
          <Form.Item
            name="area"
            label="面积(㎡)"
            rules={[{ required: true, message: '请输入面积' }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>
           <Form.Item name="structure_type" label="结构类型">
            <Select>
                <Option value="glass">玻璃温室</Option>
                <Option value="plastic">塑料大棚</Option>
                <Option value="solar">日光温室</Option>
            </Select>
          </Form.Item>
           <Form.Item name="manager_id" label="负责人">
            <Select allowClear showSearch optionFilterProp="children">
                {managers.map(user => (
                    <Option key={user.id} value={user.id}>{user.full_name}</Option>
                ))}
            </Select>
          </Form.Item>
           <Form.Item name="status" label="状态" initialValue="active">
            <Select>
                <Option value="active">正常</Option>
                <Option value="inactive">闲置</Option>
                <Option value="maintenance">维护中</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Greenhouses;
