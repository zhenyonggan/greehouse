
import { create } from 'zustand';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setRoles: (roles: string[]) => void;
  setPermissions: (permissions: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  roles: [],
  permissions: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setRoles: (roles) => set({ roles }),
  setPermissions: (permissions) => set({ permissions }),
  setIsLoading: (isLoading) => set({ isLoading }),
  login: (user, session, roles, permissions) => {
    console.log('useAuthStore login called', { user, session, roles, permissions });
    set({ user, session, roles, permissions, isLoading: false });
  },
  logout: () => set({ user: null, session: null, roles: [], permissions: [], isLoading: false }),
}));
