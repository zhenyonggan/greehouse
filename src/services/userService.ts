
import { supabase } from '../supabase/client';
import { User } from '../types';
import { createClient } from '@supabase/supabase-js';

// Create a secondary client for admin operations to avoid session conflicts
// Note: This still uses anon key, so it relies on RLS or public signup being allowed.
// For admin creation of users without logging out, we need to be careful.
// Ideally this should be a backend function.
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // Don't persist session for this client
      autoRefreshToken: false,
    }
  }
);

export const userService = {
  async getUsers(params: { page?: number; limit?: number; department?: string; position?: string; search?: string } = {}) {
    const { page = 1, limit = 10, department, position, search } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (department) {
      query = query.eq('department', department);
    }
    
    if (position) {
      query = query.eq('position', position);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.range(from, to).order('created_at', { ascending: false });

    return query;
  },

  async getUser(id: string) {
    return supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  },

  async createUser(userData: Partial<User> & { password?: string }) {
    // 1. Sign up the user in Supabase Auth (using secondary client)
    // The trigger will automatically create the user in public.users
    const { data: authData, error: authError } = await adminClient.auth.signUp({
      email: userData.email!,
      password: userData.password || '123456', // Default password
      options: {
        data: {
          full_name: userData.full_name,
        }
      }
    });

    if (authError) return { error: authError };

    if (!authData.user) return { error: { message: 'Failed to create user' } };

    // 2. Update the user with additional details (department, position, etc.)
    // The trigger only inserts basic info. We need to update the rest.
    const { error: updateError } = await supabase
      .from('users')
      .update({
        phone: userData.phone,
        department: userData.department,
        position: userData.position,
        skills: userData.skills,
        is_active: userData.is_active ?? true,
      })
      .eq('id', authData.user.id);

    if (updateError) return { error: updateError };

    return { data: authData.user };
  },

  async updateUser(id: string, updates: Partial<User>) {
    // Exclude 'role' from updates as it's not a column in users table
    // Also exclude other potentially non-existent columns if they slip in
    const { role, ...safeUpdates } = updates as any;
    
    return supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', id);
  },
  
  async deleteUser(id: string) {
    // Soft delete by setting is_active to false
    return supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);
  },
  async assignRole(userId: string, roleName: string) {
    // First get role id
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();
    
    if (roleError) return { error: roleError };

    // Delete existing roles
    await supabase.from('user_roles').delete().eq('user_id', userId);

    // Insert new role
    return supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id
      });
  },
};
