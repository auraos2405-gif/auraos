import type { AuthSession, AuthUser } from '@aura/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: AuthUser | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      setSession: (session) => set(session),
      clearSession: () => set({ accessToken: null, refreshToken: null, usuario: null }),
    }),
    {
      name: 'aura-session',
      partialize: ({ refreshToken, usuario }) => ({ refreshToken, usuario }),
    },
  ),
);

