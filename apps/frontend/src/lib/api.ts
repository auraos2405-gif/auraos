import type { ApiError, ApiSuccess } from '@aura/types';
import { useAuthStore } from '../store/auth-store';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiClientError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken, refreshToken, setSession, clearSession } = useAuthStore.getState();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401 && retry && refreshToken && path !== '/auth/refresh') {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshed.ok) {
      const payload = (await refreshed.json()) as ApiSuccess<Parameters<typeof setSession>[0]>;
      setSession(payload.data);
      return apiRequest(path, init, false);
    }
    clearSession();
  }

  const payload = (await response.json()) as ApiSuccess<T> | ApiError;
  if (!response.ok || !payload.success) {
    const error = payload as ApiError;
    throw new ApiClientError(error.error.code, error.error.message, response.status);
  }
  return payload.data;
}

