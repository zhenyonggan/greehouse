import React, { useEffect, useState } from 'react';
import { Calendar, Badge, Modal, Button, Form, Select, DatePicker, TimePicker, Input, Radio, message, Card, Tabs, List, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { farmingService } from '../../services/farmingService';
import { greenhouseService } from '../../services/greenhouseService';
import { userService } from '../../services/userService';
import { recordService } from '../../services/recordService';
import { FarmingTask, FarmingTaskType, Greenhouse, User, CropBatch } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

const FarmingPlans: React.FC = () => {
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<FarmingTask | null>(null);
  const [form] = Form.useForm();
  
  const [executeModalVisible, setExecuteModalVisible] = useState(false);
  const [executingTask, setExecutingTask] = useState<FarmingTask | null>(null);
  const [executeForm] = Form.useForm();
  
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [taskTypes, setTaskTypes] = useState<FarmingTaskType[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Fetch all tasks for simplicity for now, or fetch by current month
      const { data, error } = await farmingService.getTasks({ limit: 1000 }); // Fetch enough for calendar
      if (error) {
        console.error('Fetch tasks error:', error);
        message.error(`获取农事任务失败: ${error.message}`);
      } else {
        setTasks(data as FarmingTask[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    const { data: ghData } = await greenhouseService.getGreenhouses({ limit: 100 });
    if (ghData) setGreenhouses(ghData as Greenhouse[]);

    const { data: typeData } = await farmingService.getTaskTypes();
    if (typeData) setTaskTypes(typeData as FarmingTaskType[]);

    const { data: userData } = await userService.getUsers({ limit: 100 });
    if (userData) setWorkers(userData as User[]);
  };

  useEffect(() => {
    fetchTasks();
    fetchMetadata();
  }, []);

  const handleGreenhouseChange = async (greenhouseId: string) => {
    // When greenhouse changes, fetch its crop batches (if needed for other logic, but removed from UI)
    console.log('Greenhouse selected:', greenhouseId);
  };

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (task: FarmingTask) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      planned_date: dayjs(task.planned_date),
      planned_start_time: task.planned_start_time ? dayjs(task.planned_start_time, 'HH:mm:ss') : undefined,
      planned_end_time: task.planned_end_time ? dayjs(task.planned_end_time, 'HH:mm:ss') : undefined,
    });
    // Trigger batch loading
    handleGreenhouseChange(task.greenhouse_id);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该任务吗？',
      onOk: async () => {
        const { error } = await farmingService.deleteTask(id);
        if (error) {
          message.error('删除失败');
        } else {
          message.success('删除成功');
          fetchTasks();
        }
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const taskData = {
        ...values,
        planned_date: values.planned_date.format('YYYY-MM-DD'),
        planned_start_time: values.planned_start_time?.format('HH:mm:ss'),
        planned_end_time: values.planned_end_time?.format('HH:mm:ss'),
      };

      let result;
      if (editingTask) {
        result = await farmingService.updateTask(editingTask.id, taskData);
      } else {
        result = await farmingService.createTask(taskData);
      }

      if (result.error) {
        message.error(result.error.message);
      } else {
        message.success(editingTask ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = (task: FarmingTask) => {
    setExecutingTask(task);
    executeForm.resetFields();
    executeForm.setFieldsValue({
        execution_date: dayjs(),
        execution_start_time: dayjs(),
        execution_end_time: dayjs().add(1, 'hour'),
        worker_id: task.assigned_worker_id,
        notes: ''
    });
    setExecuteModalVisible(true);
  };

  const handleExecuteSubmit = async () => {
    try {
        const values = await executeForm.validateFields();
        setLoading(true);

        // Create record
        const recordData = {
            task_id: executingTask?.id,
            worker_id: values.worker_id,
            execution_date: values.execution_date.format('YYYY-MM-DD'),
            start_time: values.execution_start_time?.format('HH:mm:ss'),
            end_time: values.execution_end_time?.format('HH:mm:ss'),
            notes: values.notes,
            execution_result: values.execution_result
        };

        const { error: recordError } = await recordService.createRecord(recordData);
        if (recordError) throw recordError;

        // Update task status
        const { error: taskError } = await farmingService.updateTask(executingTask!.id, { status: 'completed' });
        if (taskError) throw taskError;

        message.success('任务执行记录已保存');
        setExecuteModalVisible(false);
        fetchTasks();

    } catch (error) {
        console.error(error);
        message.error('保存失败');
    } finally {
        setLoading(false);
    }
  };

  const dateCellRender = (value: dayjs.Dayjs) => {
    const listData = tasks.filter(task => dayjs(task.planned_date).isSame(value, 'day'));
    return (
      <ul className="list-none p-0 m-0">
        {listData.map(item => (
          <li key={item.id} className="mb-1">
            <Badge 
                status={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'processing' : 'warning'} 
                text={<span className="text-xs">{item.title}</span>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">农事计划</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增计划
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey="calendar" items={[
            {
                key: 'calendar',
                label: '日历视图',
                children: <Calendar dateCellRender={dateCellRender} />
            },
            {
                key: 'list',
                label: '列表视图',
                children: (
                    <List
                        itemLayout="horizontal"
                        dataSource={tasks}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    item.status !== 'completed' && (
                                        <Button icon={<CheckOutlined />} onClick={() => handleExecute(item)} type="link" className="text-green-600">执行</Button>
                                    ),
                                    <Button icon={<EditOutlined />} onClick={() => handleEdit(item)} type="link">编辑</Button>,
                                    <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)} type="link" danger>删除</Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={item.title}
                                    description={
                                        <Space>
                                            <Tag color="blue">{item.planned_date}</Tag>
                                            <span>{item.greenhouse?.name}</span>
                                            <span>负责人: {item.assigned_worker?.full_name || '未分配'}</span>
                                        </Space>
                                    }
                                />
                                <div>
                                    <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'}>
                                        {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                                    </Tag>
                                    <Tag color={item.status === 'completed' ? 'green' : item.status === 'in_progress' ? 'blue' : 'gold'}>
                                        {item.status === 'completed' ? '已完成' : item.status === 'in_progress' ? '进行中' : '待办'}
                                    </Tag>
                                </div>
                            </List.Item>
                        )}
                    />
                )
            }
        ]} />
      </Card>

      <Modal
        title={editingTask ? '编辑计划' : '新增计划'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
                name="greenhouse_id"
                label="大棚"
                rules={[{ required: true, message: '请选择大棚' }]}
            >
                <Select onChange={handleGreenhouseChange}>
                    {greenhouses.map(gh => (
                        <Option key={gh.id} value={gh.id}>{gh.name}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                name="task_type_id"
                label="任务类型"
                rules={[{ required: true, message: '请选择任务类型' }]}
            >
                <Select>
                    {taskTypes.map(type => (
                        <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <Form.Item
                name="assigned_worker_id"
                label="执行人"
            >
                <Select showSearch optionFilterProp="children">
                    {workers.map(worker => (
                        <Option key={worker.id} value={worker.id}>{worker.full_name}</Option>
                    ))}
                </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <Form.Item
                name="planned_date"
                label="计划日期"
                rules={[{ required: true, message: '请选择日期' }]}
            >
                <DatePicker className="w-full" />
            </Form.Item>
             <Form.Item
                name="planned_start_time"
                label="开始时间"
            >
                <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
             <Form.Item
                name="planned_end_time"
                label="结束时间"
            >
                <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </div>

          <Form.Item name="priority" label="优先级" initialValue="medium">
            <Radio.Group>
                <Radio value="high">高</Radio>
                <Radio value="medium">中</Radio>
                <Radio value="low">低</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item name="description" label="任务描述">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="执行任务"
        open={executeModalVisible}
        onOk={handleExecuteSubmit}
        onCancel={() => setExecuteModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={executeForm} layout="vertical">
            <Form.Item
                name="execution_date"
                label="执行日期"
                rules={[{ required: true, message: '请选择日期' }]}
            >
                <DatePicker className="w-full" />
            </Form.Item>
             <div className="grid grid-cols-2 gap-4">
                <Form.Item
                    name="execution_start_time"
                    label="开始时间"
                >
                    <TimePicker className="w-full" format="HH:mm" />
                </Form.Item>
                <Form.Item
                    name="execution_end_time"
                    label="结束时间"
                >
                    <TimePicker className="w-full" format="HH:mm" />
                </Form.Item>
             </div>
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
            <Form.Item name="execution_result" label="执行结果">
                <TextArea rows={2} placeholder="例如：任务完成顺利，无异常" />
            </Form.Item>
            <Form.Item name="notes" label="备注">
                <TextArea rows={2} />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FarmingPlans;