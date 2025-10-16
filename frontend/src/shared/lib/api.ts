// src/shared/lib/api.ts

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
