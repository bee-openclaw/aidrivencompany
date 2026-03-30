import type { Campaign } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchCampaigns(companyId: string): Promise<Campaign[]> {
  return apiFetch<Campaign[]>(`/companies/${companyId}/campaigns`);
}
