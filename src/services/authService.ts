
import { supabase } from '../supabase/client';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

export const authService = {
  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.fetchUserProfile(session.user.id, session);
    } else {
      useAuthStore.getState().setIsLoading(false);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      if (session) {
        // Only fetch if not already loaded or user changed
        const currentUser = useAuthStore.getState().user;
        if (!currentUser || currentUser.id !== session.user.id) {
             await this.fetchUserProfile(session.user.id, session);
        }
      } else {
        useAuthStore.getState().logout();
      }
    });
  },

  async fetchUserProfile(userId: string, session: any) {
    try {
      console.log('Fetching user profile for:', userId);
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
         console.error('Error fetching user details:', userError);
         // If user not found in public.users, create it from session
         if (userError.code === 'PGRST116') { // no rows returned
            console.log('User not found in public.users, creating...');
            const { error: insertError } = await supabase.from('users').insert({
              id: userId,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || 'User',
              password_hash: 'managed_by_supabase_auth'
            });
            
            if (insertError) {
              console.error('Error creating user in public.users:', insertError);
              throw insertError;
            }
            
            // Retry fetch
            const { data: newUser, error: newUserError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (newUserError) throw newUserError;
            user = newUser;
         } else {
            throw userError;
         }
       }
      
      console.log('User details fetched:', user);

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(name, permissions)')
        .eq('user_id', userId);

      if (rolesError) {
         console.error('Error fetching user roles:', rolesError);
         throw rolesError;
      }
      
      console.log('User roles fetched:', userRoles);

      const roles = userRoles.map((ur: any) => ur.roles.name);
      const permissions = userRoles.flatMap((ur: any) => ur.roles.permissions);

      useAuthStore.getState().login(user as User, session, roles, permissions);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Do NOT logout immediately, just log the error. 
      // Logout might cause redirect loops if the user is authenticated but profile fetch fails.
      // Instead, we might want to set a partial state or show an error.
      // But for now, let's just NOT logout to see if that's the issue.
      // useAuthStore.getState().logout(); 
      
      // If profile fetch fails, we might still want to let them in if they have a session?
      // No, because we need user details. 
      // But maybe the issue is that the user record doesn't exist in public.users yet?
      // The trigger should handle it, but maybe it failed.
      // Let's try to handle the case where user is not found in public.users
    }
  },

  async login(email: string) {
    // For this demo, we'll use Magic Link or simple sign up if needed.
    // However, PRD mentions password login. Supabase supports email/password.
    // Let's implement email/password login.
    // But first, we need to check if we need to sign up first?
    // The PRD says "Admin creates users". So users are pre-created.
    // We should assume users exist.
    // For development, I might need a way to create the first admin user.
    // I'll add a temporary signup function or just use Supabase Auth API.
    
    // Actually, let's just use signInWithPassword
    return supabase.auth.signInWithPassword({
      email,
      password: 'password123', // Default password for now as per PRD "Admin assigns account" logic implies set password
    });
  },
  
  async loginWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.session) {
      await this.fetchUserProfile(data.user.id, data.session);
    }
    
    return { data, error };
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  },

  async logout() {
    return supabase.auth.signOut();
  }
};
