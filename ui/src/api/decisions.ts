import type { Decision } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchDecisions(companyId: string): Promise<Decision[]> {
  return apiFetch<Decision[]>(`/companies/${companyId}/decisions`);
}
