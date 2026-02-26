
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, Select, message, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import { User } from '../../types';

const { Option } = Select;

const Personnel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await userService.getUsers({ search, department: departmentFilter });
      if (error) {
        message.error('获取人员列表失败');
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, departmentFilter]);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      skills: record.skills || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该人员吗？',
      onOk: async () => {
        const { error } = await userService.deleteUser(id);
        if (error) {
          message.error('删除失败');
        } else {
          message.success('删除成功');
          fetchUsers();
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      let result;
      if (editingUser) {
        // Remove 'role' from values before updating user object as it's not a column in users table
        const { role, ...userUpdates } = values;
        result = await userService.updateUser(editingUser.id, userUpdates);
      } else {
        result = await userService.createUser(values);
      }

      if (result.error) {
        message.error(result.error.message);
      } else {
        // Handle role assignment if role is selected (needs extra logic in form)
        if (values.role) {
            await userService.assignRole(editingUser ? editingUser.id : result.data.id, values.role);
        }

        message.success(editingUser ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchUsers();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
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
        <h1 className="text-2xl font-bold">人员管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加人员
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索姓名或邮箱"
            prefix={<SearchOutlined />}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            placeholder="筛选部门"
            allowClear
            onChange={(value) => setDepartmentFilter(value)}
            className="w-48"
          >
            <Option value="种植部">种植部</Option>
            <Option value="技术部">技术部</Option>
            <Option value="管理部">管理部</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑人员' : '添加人员'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="full_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
             <Form.Item
                name="password"
                label="初始密码"
                initialValue="123456"
                rules={[{ required: true, message: '请输入初始密码' }]}
             >
                <Input.Password />
             </Form.Item>
          )}
          <Form.Item name="department" label="部门">
            <Select>
              <Option value="种植部">种植部</Option>
              <Option value="技术部">技术部</Option>
              <Option value="管理部">管理部</Option>
            </Select>
          </Form.Item>
          <Form.Item name="position" label="职位">
            <Input />
          </Form.Item>
           <Form.Item name="role" label="系统角色" initialValue="worker">
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="manager">大棚管理员</Option>
              <Option value="technician">技术人员</Option>
              <Option value="worker">普通工人</Option>
            </Select>
          </Form.Item>
          <Form.Item name="skills" label="技能特长">
            <Select mode="tags" placeholder="输入技能后回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Personnel;
