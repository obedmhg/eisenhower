import type { Task, SavedMatrix } from '../types';

interface User {
  id: number;
  email: string;
}

interface Snapshot {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
  /** Server-side state version; echoed back on replaceState for conflict detection. */
  version?: number;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let err = 'request_failed';
    let data: unknown = null;
    try {
      data = await res.json();
      const msg = (data as { error?: unknown } | null)?.error;
      if (typeof msg === 'string') err = msg;
    } catch {
      // non-JSON error body; keep generic message
    }
    throw new ApiError(err, res.status, data);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<{ user: User | null }>('/api/auth-me'),
  signup: (email: string, password: string) =>
    request<{ user: User }>('/api/auth-signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>('/api/auth-logout', { method: 'POST' }),
  getState: () => request<Snapshot>('/api/state-get'),
  replaceState: (snapshot: Snapshot, baseVersion: number) =>
    request<{ ok: true; version: number }>('/api/state-replace', {
      method: 'PUT',
      body: JSON.stringify({ ...snapshot, baseVersion }),
    }),
};

export type { User, Snapshot };
