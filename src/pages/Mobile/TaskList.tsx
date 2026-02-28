
import React, { useEffect, useState } from 'react';
import { Card, Calendar, List, Tag, FloatingBubble } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { farmingService } from '../../services/farmingService';
import { FarmingTask } from '../../types';
import dayjs from 'dayjs';

const MobileTasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const { data } = await farmingService.getTasks({ planned_date: dateStr });
      setTasks(data as FarmingTask[]);
    };
    fetchTasks();
  }, [selectedDate]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <Calendar 
            selectionMode='single'
            defaultValue={selectedDate}
            onChange={val => val && setSelectedDate(val)} 
        />
      </div>

      <div className="p-3">
        <h3 className="text-gray-500 mb-3 ml-1">{dayjs(selectedDate).format('MM月DD日')} 任务列表</h3>
        {tasks.length === 0 ? (
            <div className="text-center py-10 text-gray-400">暂无任务</div>
        ) : (
            tasks.map(task => (
                <Card key={task.id} className="mb-3" onClick={() => navigate(`/m/tasks/${task.id}`)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-lg mb-1">{task.title}</div>
                            <div className="text-sm text-gray-500">
                                {task.greenhouse?.name} | {task.task_type?.name}
                            </div>
                        </div>
                        <Tag color={task.priority === 'high' ? 'danger' : 'primary'}>
                            {task.priority === 'high' ? '高' : '中'}
                        </Tag>
                    </div>
                </Card>
            ))
        )}
      </div>
      
      <FloatingBubble 
        axis='xy'
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '20px' }}
        onClick={() => {}}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  );
};

export default MobileTasks;
