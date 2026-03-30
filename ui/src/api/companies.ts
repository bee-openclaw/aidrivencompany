import type { Company } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchCompanies(): Promise<Company[]> {
  return apiFetch<Company[]>('/companies');
}

export function fetchCompany(id: string): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`);
}

export function createCompany(
  name: string,
  description: string,
  vision?: string,
): Promise<Company> {
  return apiFetch<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify({ name, description, vision }),
  });
}
