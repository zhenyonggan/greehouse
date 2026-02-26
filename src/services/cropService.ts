
import { supabase } from '../supabase/client';
import { Crop } from '../types';

export const cropService = {
  async getCrops(params: { page?: number; limit?: number; category?: string; search?: string } = {}) {
    const { page = 1, limit = 10, category, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('crops')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    query = query.eq('is_active', true).range(from, to).order('created_at', { ascending: false });

    return query;
  },

  async getCrop(id: string) {
    return supabase
      .from('crops')
      .select('*')
      .eq('id', id)
      .single();
  },

  async createCrop(crop: Partial<Crop>) {
    return supabase
      .from('crops')
      .insert(crop);
  },

  async updateCrop(id: string, updates: Partial<Crop>) {
    return supabase
      .from('crops')
      .update(updates)
      .eq('id', id);
  },

  async deleteCrop(id: string) {
    return supabase
      .from('crops')
      .update({ is_active: false })
      .eq('id', id);
  }
};
