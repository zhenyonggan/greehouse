
import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, DatePicker, TimePicker, message, Card } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { recordService } from '../../services/recordService';
import { farmingService } from '../../services/farmingService';
import { userService } from '../../services/userService';
import { FarmingRecord, FarmingTask, User } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const FarmingRecords: React.FC = () => {
  const [records, setRecords] = useState<FarmingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FarmingRecord | null>(null);
  const [form] = Form.useForm();
  
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  
  const { user } = useAuthStore();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await recordService.getRecords({
          start_date: dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined,
          end_date: dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined,
      });
      if (error) {
        message.error('获取记录失败');
      } else {
        setRecords(data as FarmingRecord[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    // Ideally only fetch tasks assigned to current user or pending tasks
    const { data: taskData } = await farmingService.getTasks({ limit: 100 }); // Simplified
    if (taskData) setTasks(taskData as FarmingTask[]);

    const { data: userData } = await userService.getUsers({ limit: 100 });
    if (userData) setWorkers(userData as User[]);
  };

  useEffect(() => {
    fetchRecords();
    fetchMetadata();
  }, [dateRange]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    // Default to current user
    if (user) {
        form.setFieldsValue({ worker_id: user.id });
    }
    setModalVisible(true);
  };

  const handleEdit = (record: FarmingRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      execution_date: dayjs(record.execution_date),
      start_time: record.start_time ? dayjs(record.start_time, 'HH:mm:ss') : undefined,
      end_time: record.end_time ? dayjs(record.end_time, 'HH:mm:ss') : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除条记录吗？',
      onOk: async () => {
        const { error } = await recordService.deleteRecord(id);
        if (error) {
          message.error('删除失败');
        } else {
          message.success('删除成功');
          fetchRecords();
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const recordData = {
        ...values,
        execution_date: values.execution_date.format('YYYY-MM-DD'),
        start_time: values.start_time?.format('HH:mm:ss'),
        end_time: values.end_time?.format('HH:mm:ss'),
      };

      let result;
      if (editingRecord) {
        result = await recordService.updateRecord(editingRecord.id, recordData);
      } else {
        result = await recordService.createRecord(recordData);
      }

      if (result.error) {
        message.error(result.error.message);
      } else {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchRecords();
        // Optionally update task status to completed
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '任务标题',
      dataIndex: ['task', 'title'],
      key: 'task_title',
      render: (text: string, record: FarmingRecord) => record.task?.title
    },
    {
      title: '大棚',
      dataIndex: ['task', 'greenhouse', 'name'],
      key: 'greenhouse_name',
      render: (text: string, record: FarmingRecord) => record.task?.greenhouse?.name
    },
    {
      title: '执行日期',
      dataIndex: 'execution_date',
      key: 'execution_date',
    },
    {
      title: '执行人',
      dataIndex: ['worker', 'full_name'],
      key: 'worker_name',
      render: (text: string, record: FarmingRecord) => record.worker?.full_name
    },
    {
      title: '执行结果',
      dataIndex: 'execution_result',
      key: 'execution_result',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FarmingRecord) => (
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
        <h1 className="text-2xl font-bold">农事记录</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加记录
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <RangePicker 
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
        </div>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑记录' : '添加记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="task_id"
            label="关联任务"
            rules={[{ required: true, message: '请选择关联任务' }]}
          >
            <Select showSearch optionFilterProp="children">
                {tasks.map(task => (
                    <Option key={task.id} value={task.id}>{task.title} ({task.planned_date})</Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="worker_id"
            label="执行人"
            rules={[{ required: true, message: '请选择执行人' }]}
          >
            <Select showSearch optionFilterProp="children">
                {workers.map(worker => (
                    <Option key={worker.id} value={worker.id}>{worker.full_name}</Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="execution_date"
            label="执行日期"
            rules={[{ required: true, message: '请选择执行日期' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
             <Form.Item name="start_time" label="开始时间">
                <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
             <Form.Item name="end_time" label="结束时间">
                <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </div>
          <Form.Item name="execution_result" label="执行结果">
            <Select>
                <Option value="完成">完成</Option>
                <Option value="部分完成">部分完成</Option>
                <Option value="未完成">未完成</Option>
            </Select>
          </Form.Item>
          <Form.Item name="weather_conditions" label="天气情况">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmingRecords;
