
import { supabase } from '../supabase/client';
import { Greenhouse, CropBatch } from '../types';

export const greenhouseService = {
  async getGreenhouses(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const { page = 1, limit = 10, status, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('greenhouses')
      .select('*, manager:users(id, full_name)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    query = query.range(from, to).order('created_at', { ascending: false });

    return query;
  },

  async getGreenhouse(id: string) {
    return supabase
      .from('greenhouses')
      .select('*, manager:users(id, full_name)')
      .eq('id', id)
      .single();
  },

  async createGreenhouse(greenhouse: Partial<Greenhouse>) {
    return supabase
      .from('greenhouses')
      .insert(greenhouse);
  },

  async updateGreenhouse(id: string, updates: Partial<Greenhouse>) {
    return supabase
      .from('greenhouses')
      .update(updates)
      .eq('id', id);
  },

  async deleteGreenhouse(id: string) {
    return supabase
      .from('greenhouses')
      .delete()
      .eq('id', id);
  },

  async getCropBatches(greenhouseId: string) {
    return supabase
      .from('crop_batches')
      .select('*, crop:crops(name), assigned_worker:users(full_name)')
      .eq('greenhouse_id', greenhouseId)
      .order('created_at', { ascending: false });
  },

  async createCropBatch(batch: Partial<CropBatch>) {
    return supabase
      .from('crop_batches')
      .insert(batch);
  }
};
