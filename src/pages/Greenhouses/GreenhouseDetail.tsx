import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tabs, Table, Tag, Space, Modal, Form, Select, DatePicker, InputNumber, message, Spin, Calendar, Badge, List, Empty } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, CalendarOutlined, UnorderedListOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { greenhouseService } from '../../services/greenhouseService';
import { cropService } from '../../services/cropService';
import { userService } from '../../services/userService';
import { farmingService } from '../../services/farmingService';
import { Greenhouse, CropBatch, Crop, User, FarmingTask } from '../../types';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Option } = Select;

const GreenhouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [greenhouse, setGreenhouse] = useState<Greenhouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<CropBatch[]>([]);
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [calendarTasks, setCalendarTasks] = useState<FarmingTask[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: ghData, error: ghError } = await greenhouseService.getGreenhouse(id);
      if (ghError) throw ghError;
      setGreenhouse(ghData as Greenhouse);

      const { data: batchData, error: batchError } = await greenhouseService.getCropBatches(id);
      if (batchError) throw batchError;
      setBatches(batchData as CropBatch[]);

      const { data: cropData } = await cropService.getCrops({ limit: 100 });
      if (cropData) setCrops(cropData as Crop[]);

      const { data: userData } = await userService.getUsers({ limit: 100 });
      if (userData) setWorkers(userData as User[]);

      // Fetch recent tasks
      const { data: taskData } = await farmingService.getTasks({ greenhouse_id: id, limit: 50 });
      if (taskData) setTasks(taskData as FarmingTask[]);

      // Fetch tasks for current month for calendar (initial load)
      const now = dayjs();
      // Use a broader range to cover previous/next month days shown in calendar view
      // Just fetching the whole year for simplicity to ensure all months work when switching
      // Or at least current month +/- 1 month
      const { data: calData } = await farmingService.getTasks({ greenhouse_id: id, limit: 1000 });
      if (calData) setCalendarTasks(calData as FarmingTask[]);

    } catch (error) {
      console.error(error);
      message.error('获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddBatch = async () => {
    try {
      const values = await form.validateFields();
      const batchData = {
        ...values,
        greenhouse_id: id,
        batch_code: `BATCH-${dayjs().format('YYYYMMDDHHmmss')}`,
        planting_date: values.planting_date.format('YYYY-MM-DD'),
        expected_harvest_date: values.expected_harvest_date?.format('YYYY-MM-DD'),
        status: 'growing',
      };

      const { error } = await greenhouseService.createCropBatch(batchData);
      if (error) {
        message.error('添加作物批次失败');
      } else {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCalendarPanelChange = async (value: Dayjs, mode: string) => {
    // Since we fetch all tasks upfront now (limit 1000), we don't need to refetch on month change
    // unless we have pagination. For this MVP, assuming 1000 tasks is enough for recent history.
    // If needed, we can implement month-based fetching again.
    // But let's keep it simple and robust.
    console.log('Calendar panel change:', value.format('YYYY-MM'), mode);
  };

  const dateCellRender = (value: Dayjs) => {
    // Convert planned_date string to Dayjs object and compare by day
    // Also handle timezone potential issues by formatting both to YYYY-MM-DD
    const dateString = value.format('YYYY-MM-DD');
    const listData = calendarTasks.filter(task => task.planned_date === dateString);
    
    // Ant Design Calendar cells have a fixed height or min-height, 
    // ensure we return something visible
    if (listData.length === 0) return null;

    return (
      <ul className="list-none p-0 m-0">
        {listData.map((item) => (
          <li key={item.id} className="mb-1">
            <Badge 
              status={item.status === 'completed' ? 'success' : item.status === 'cancelled' ? 'error' : 'warning'} 
              text={<span className="text-xs">{item.title}</span>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  const batchColumns = [
    {
      title: '批次编号',
      dataIndex: 'batch_code',
      key: 'batch_code',
    },
    {
      title: '作物名称',
      dataIndex: ['crop', 'name'],
      key: 'crop_name',
      render: (text: string, record: CropBatch) => record.crop?.name
    },
    {
      title: '种植面积(㎡)',
      dataIndex: 'planting_area',
      key: 'planting_area',
    },
    {
      title: '种植日期',
      dataIndex: 'planting_date',
      key: 'planting_date',
    },
    {
      title: '负责人',
      dataIndex: ['assigned_worker', 'full_name'],
      key: 'assigned_worker',
      render: (text: string, record: CropBatch) => record.assigned_worker?.full_name || '未分配'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        switch (status) {
          case 'growing': color = 'green'; text = '生长中'; break;
          case 'harvested': color = 'blue'; text = '已收获'; break;
          case 'failed': color = 'red'; text = '失败'; break;
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
  ];

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '任务类型',
      dataIndex: ['task_type', 'name'],
      key: 'task_type',
      render: (text: string, record: FarmingTask) => record.task_type?.name || '其他'
    },
    {
      title: '计划日期',
      dataIndex: 'planned_date',
      key: 'planned_date',
    },
    {
      title: '负责人',
      dataIndex: ['assigned_worker', 'full_name'],
      key: 'assigned_worker',
      render: (text: string, record: FarmingTask) => record.assigned_worker?.full_name || '未分配'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
         let color = 'default';
         let text = status;
         switch (status) {
           case 'pending': color = 'orange'; text = '待执行'; break;
           case 'in_progress': color = 'blue'; text = '执行中'; break;
           case 'completed': color = 'green'; text = '已完成'; break;
           case 'cancelled': color = 'red'; text = '已取消'; break;
         }
         return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;
  }

  if (!greenhouse) {
    return <div>未找到大棚信息</div>;
  }

  const items = [
    {
      key: '1',
      label: <span><InfoCircleOutlined />基本信息 & 种植</span>,
      children: (
        <div className="space-y-4">
            <Card title="基本信息" bordered={false}>
            <Descriptions column={3}>
            <Descriptions.Item label="编号">{greenhouse.code}</Descriptions.Item>
            <Descriptions.Item label="位置">{greenhouse.location}</Descriptions.Item>
            <Descriptions.Item label="面积">{greenhouse.area} ㎡</Descriptions.Item>
            <Descriptions.Item label="结构类型">
                {greenhouse.structure_type === 'glass' ? '玻璃温室' : 
                greenhouse.structure_type === 'plastic' ? '塑料大棚' : 
                greenhouse.structure_type === 'solar' ? '日光温室' : greenhouse.structure_type}
            </Descriptions.Item>
            <Descriptions.Item label="负责人">{greenhouse.manager?.full_name || '未分配'}</Descriptions.Item>
            <Descriptions.Item label="状态">
                <Tag color={greenhouse.status === 'active' ? 'green' : greenhouse.status === 'inactive' ? 'red' : 'orange'}>
                    {greenhouse.status === 'active' ? '正常' : greenhouse.status === 'inactive' ? '闲置' : '维护中'}
                </Tag>
            </Descriptions.Item>
            </Descriptions>
        </Card>

        <Card title="种植批次" bordered={false} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>分配作物</Button>}>
            <Table
                columns={batchColumns}
                dataSource={batches}
                rowKey="id"
                pagination={false}
            />
        </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: <span><UnorderedListOutlined />农事任务</span>,
      children: (
        <Card bordered={false}>
            <Table
                columns={taskColumns}
                dataSource={tasks}
                rowKey="id"
            />
        </Card>
      ),
    },
    {
      key: '3',
      label: <span><CalendarOutlined />农事日历</span>,
      children: (
        <Card bordered={false}>
            <Calendar dateCellRender={dateCellRender} onPanelChange={onCalendarPanelChange} />
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/greenhouses')} className="mr-4" />
        <h1 className="text-2xl font-bold mb-0">大棚详情: {greenhouse.name}</h1>
      </div>

      <Tabs defaultActiveKey="1" items={items} />

      <Modal
        title="分配作物"
        open={modalVisible}
        onOk={handleAddBatch}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="crop_id"
            label="选择作物"
            rules={[{ required: true, message: '请选择作物' }]}
          >
            <Select showSearch optionFilterProp="children">
              {crops.map(crop => (
                <Option key={crop.id} value={crop.id}>{crop.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="planting_area"
            label="种植面积(㎡)"
            rules={[{ required: true, message: '请输入种植面积' }]}
          >
            <InputNumber className="w-full" max={greenhouse.area} />
          </Form.Item>
          <Form.Item
            name="planting_quantity"
            label="种植数量"
            rules={[{ required: true, message: '请输入种植数量' }]}
          >
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item
            name="planting_date"
            label="种植日期"
            rules={[{ required: true, message: '请选择种植日期' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
           <Form.Item
            name="expected_harvest_date"
            label="预计收获日期"
          >
            <DatePicker className="w-full" />
          </Form.Item>
           <Form.Item
            name="assigned_worker_id"
            label="种植负责人"
          >
            <Select showSearch optionFilterProp="children">
              {workers.map(worker => (
                <Option key={worker.id} value={worker.id}>{worker.full_name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GreenhouseDetail;