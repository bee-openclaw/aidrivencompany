import { apiFetch } from './client';

export function fetchSettings(): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>('/settings');
}

export function updateSetting(key: string, value: string): Promise<void> {
  return apiFetch<void>('/settings', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  });
}
