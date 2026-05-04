import type { Task, SavedMatrix } from '../types';

interface User {
  id: number;
  email: string;
}

interface Snapshot {
  tasks: Task[];
  savedMatrices: SavedMatrix[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let err = 'request_failed';
    try {
      const data = await res.json();
      if (data?.error) err = data.error;
    } catch {}
    throw new Error(err);
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
  replaceState: (snapshot: Snapshot) =>
    request<{ ok: true }>('/api/state-replace', {
      method: 'PUT',
      body: JSON.stringify(snapshot),
    }),
  mergeState: (snapshot: Snapshot) =>
    request<Snapshot>('/api/state-merge', {
      method: 'POST',
      body: JSON.stringify(snapshot),
    }),
};

export type { User, Snapshot };
