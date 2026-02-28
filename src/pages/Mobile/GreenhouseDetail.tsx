
import React, { useEffect, useState } from 'react';
import { NavBar, Tabs, Card, List, Button, SpinLoading, Tag } from 'antd-mobile';
import { useNavigate, useParams } from 'react-router-dom';
import { greenhouseService } from '../../services/greenhouseService';
import { farmingService } from '../../services/farmingService';
import { Greenhouse, CropBatch, FarmingTask } from '../../types';
import dayjs from 'dayjs';

const MobileGreenhouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [greenhouse, setGreenhouse] = useState<Greenhouse | null>(null);
  const [batches, setBatches] = useState<CropBatch[]>([]);
  const [tasks, setTasks] = useState<FarmingTask[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: ghData } = await greenhouseService.getGreenhouse(id);
        setGreenhouse(ghData as Greenhouse);

        const { data: batchData } = await greenhouseService.getCropBatches(id);
        setBatches(batchData as CropBatch[]);

        const { data: taskData } = await farmingService.getTasks({ greenhouse_id: id, limit: 20 });
        setTasks(taskData as FarmingTask[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-full"><SpinLoading /></div>;
  if (!greenhouse) return <div>未找到大棚</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar onBack={() => navigate(-1)}>{greenhouse.name}</NavBar>
      
      <Tabs>
        <Tabs.Tab title='基本信息' key='info'>
            <div className="p-3 space-y-3">
                <Card title="大棚概况">
                    <List>
                        <List.Item extra={greenhouse.code}>编号</List.Item>
                        <List.Item extra={`${greenhouse.area} ㎡`}>面积</List.Item>
                        <List.Item extra={greenhouse.location}>位置</List.Item>
                        <List.Item extra={greenhouse.manager?.full_name}>负责人</List.Item>
                        <List.Item extra={<Tag color='success'>{greenhouse.status}</Tag>}>状态</List.Item>
                    </List>
                </Card>
                <Card title="种植批次">
                    {batches.map(batch => (
                        <div key={batch.id} className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between font-bold mb-1">
                                <span>{batch.crop?.name}</span>
                                <span className="text-green-600">{batch.status}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                <div>批次: {batch.batch_code}</div>
                                <div>种植: {batch.planting_date}</div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs.Tab>
        <Tabs.Tab title='农事任务' key='tasks'>
            <div className="p-3">
                {tasks.map(task => (
                    <Card key={task.id} className="mb-3" onClick={() => navigate(`/m/tasks/${task.id}`)}>
                        <div className="flex justify-between mb-2">
                            <span className="font-bold">{task.title}</span>
                            <Tag color={task.status === 'completed' ? 'success' : 'primary'}>
                                {task.status === 'completed' ? '已完成' : '进行中'}
                            </Tag>
                        </div>
                        <div className="text-sm text-gray-500">
                            <div>计划日期: {task.planned_date}</div>
                            <div>负责人: {task.assigned_worker?.full_name}</div>
                        </div>
                    </Card>
                ))}
            </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default MobileGreenhouseDetail;
