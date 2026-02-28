
import React, { useEffect, useState } from 'react';
import { Card, Grid, List, Tag, SpinLoading } from 'antd-mobile';
import { useAuthStore } from '../../store/useAuthStore';
import { greenhouseService } from '../../services/greenhouseService';
import { farmingService } from '../../services/farmingService';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CloudSun } from 'lucide-react';

const MobileDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    greenhouseCount: 0,
    taskCount: 0,
  });
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { count: ghCount } = await greenhouseService.getGreenhouses({ limit: 1 });
        const { count: taskCount } = await farmingService.getTasksByDateRange(
            dayjs().format('YYYY-MM-DD'), 
            dayjs().format('YYYY-MM-DD')
        );
        const { data: recentTasks } = await farmingService.getTasks({ limit: 5, status: 'pending' });

        setStats({
          greenhouseCount: ghCount || 0,
          taskCount: taskCount || 0,
        });
        if (recentTasks) setTasks(recentTasks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full"><SpinLoading /></div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">早安, {user?.full_name}</h1>
          <p className="text-sm text-gray-500">{dayjs().format('YYYY年MM月DD日 dddd')}</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            {user?.full_name?.charAt(0)}
        </div>
      </div>

      <Grid columns={2} gap={12}>
        <Grid.Item onClick={() => navigate('/m/weather')} className="col-span-2">
           <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-md">
             <div className="flex items-center justify-between">
               <div>
                 <div className="text-lg font-bold">天气气象</div>
                 <div className="text-sm opacity-90">查看实时天气与预报</div>
               </div>
               <CloudSun size={32} />
             </div>
           </Card>
        </Grid.Item>
        <Grid.Item onClick={() => navigate('/m/greenhouses')}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-sm">
            <div className="text-2xl font-bold text-green-700">{stats.greenhouseCount}</div>
            <div className="text-sm text-green-600">管理大棚</div>
          </Card>
        </Grid.Item>
        <Grid.Item onClick={() => navigate('/m/tasks')}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
            <div className="text-2xl font-bold text-blue-700">{stats.taskCount}</div>
            <div className="text-sm text-blue-600">今日任务</div>
          </Card>
        </Grid.Item>
      </Grid>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">待办任务</h2>
            <span className="text-sm text-blue-600" onClick={() => navigate('/m/tasks')}>全部 &gt;</span>
        </div>
        
        {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-lg">暂无待办任务</div>
        ) : (
            <List className="bg-white rounded-lg overflow-hidden shadow-sm">
            {tasks.map(task => (
                <List.Item
                key={task.id}
                prefix={
                    <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                }
                description={`${task.greenhouse?.name} | ${dayjs(task.planned_date).format('MM-DD')}`}
                onClick={() => navigate(`/m/tasks/${task.id}`)}
                >
                {task.title}
                </List.Item>
            ))}
            </List>
        )}
      </div>
    </div>
  );
};

export default MobileDashboard;
