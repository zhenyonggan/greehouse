
import { supabase } from '../supabase/client';
import { FarmingRecord } from '../types';

export const recordService = {
  async getRecords(params: { page?: number; limit?: number; task_id?: string; worker_id?: string; start_date?: string; end_date?: string } = {}) {
    const { page = 1, limit = 10, task_id, worker_id, start_date, end_date } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('farming_records')
      .select('*, task:farming_tasks(title, greenhouse:greenhouses(name)), worker:users(full_name)', { count: 'exact' });

    if (task_id) {
      query = query.eq('task_id', task_id);
    }

    if (worker_id) {
      query = query.eq('worker_id', worker_id);
    }

    if (start_date) {
      query = query.gte('execution_date', start_date);
    }

    if (end_date) {
      query = query.lte('execution_date', end_date);
    }

    query = query.range(from, to).order('execution_date', { ascending: false });

    return query;
  },

  async getRecord(id: string) {
    return supabase
      .from('farming_records')
      .select('*, task:farming_tasks(title, greenhouse:greenhouses(name)), worker:users(full_name)')
      .eq('id', id)
      .single();
  },

  async createRecord(record: Partial<FarmingRecord>) {
    // When creating a record, we should also update the task status to 'completed' if needed
    // But let's keep it separate or handle in UI
    return supabase
      .from('farming_records')
      .insert(record);
  },

  async updateRecord(id: string, updates: Partial<FarmingRecord>) {
    return supabase
      .from('farming_records')
      .update(updates)
      .eq('id', id);
  },

  async deleteRecord(id: string) {
    return supabase
      .from('farming_records')
      .delete()
      .eq('id', id);
  }
};
