import type { AuthSession, AuthUser, Company } from '@aura/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: AuthUser | null;
  empresa: Company | null;
  setSession: (session: AuthSession & { empresa?: Company | null }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      empresa: null,
      setSession: (session) => set({ ...session, empresa: session.empresa ?? null }),
      clearSession: () => set({ accessToken: null, refreshToken: null, usuario: null, empresa: null }),
    }),
    {
      name: 'aura-session',
      partialize: ({ refreshToken, usuario, empresa }) => ({ refreshToken, usuario, empresa }),
    },
  ),
);
