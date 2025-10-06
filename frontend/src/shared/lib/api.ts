// src/shared/lib/api.ts

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
