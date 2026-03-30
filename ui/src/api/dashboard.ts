import type { DashboardData } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchDashboard(companyId: string): Promise<DashboardData> {
  return apiFetch<DashboardData>(`/companies/${companyId}/dashboard`);
}
