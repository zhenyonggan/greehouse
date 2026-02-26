
import { supabase } from '../supabase/client';
import { FarmingTask, FarmingTaskType } from '../types';

export const farmingService = {
  async getTasks(params: { page?: number; limit?: number; greenhouse_id?: string; planned_date?: string; status?: string } = {}) {
    const { page = 1, limit = 10, greenhouse_id, planned_date, status } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('farming_tasks')
      .select('*, greenhouse:greenhouses(name), task_type:farming_task_types(name), assigned_worker:users(full_name)', { count: 'exact' });

    if (greenhouse_id) {
      query = query.eq('greenhouse_id', greenhouse_id);
    }

    if (planned_date) {
      query = query.eq('planned_date', planned_date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(from, to).order('planned_date', { ascending: true });

    return query;
  },

  async getTask(id: string) {
    return supabase
      .from('farming_tasks')
      .select('*, greenhouse:greenhouses(name), task_type:farming_task_types(name), assigned_worker:users(full_name)')
      .eq('id', id)
      .single();
  },

  async createTask(task: Partial<FarmingTask>) {
    return supabase
      .from('farming_tasks')
      .insert(task);
  },

  async updateTask(id: string, updates: Partial<FarmingTask>) {
    return supabase
      .from('farming_tasks')
      .update(updates)
      .eq('id', id);
  },

  async deleteTask(id: string) {
    return supabase
      .from('farming_tasks')
      .delete()
      .eq('id', id);
  },

  async getTaskTypes() {
    return supabase
      .from('farming_task_types')
      .select('*')
      .eq('is_active', true);
  },

  async getTasksByMonth(year: number, month: number, greenhouse_id?: string) {
      const start = `${year}-${month.toString().padStart(2, '0')}-01`;
      // Calculate end date properly or just query the whole month
      const end = `${year}-${month.toString().padStart(2, '0')}-31`; 
      
      let query = supabase
        .from('farming_tasks')
        .select('*, greenhouse:greenhouses(name), task_type:farming_task_types(name), assigned_worker:users(full_name)')
        .gte('planned_date', start)
        .lte('planned_date', end);

      if (greenhouse_id) {
        query = query.eq('greenhouse_id', greenhouse_id);
      }

      return query;
  },

  async getTasksByDateRange(startDate: string, endDate: string) {
    return supabase
      .from('farming_tasks')
      .select('id, planned_date, status', { count: 'exact' })
      .gte('planned_date', startDate)
      .lte('planned_date', endDate);
  }
};
