import type { Simulation } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchSimulations(companyId: string): Promise<Simulation[]> {
  return apiFetch<Simulation[]>(`/companies/${companyId}/simulations`);
}

export function applySimulation(companyId: string, simulationId: string): Promise<Simulation> {
  return apiFetch<Simulation>(`/companies/${companyId}/simulations/${simulationId}/apply`, {
    method: 'PUT',
  });
}

export function rejectSimulation(companyId: string, simulationId: string): Promise<Simulation> {
  return apiFetch<Simulation>(`/companies/${companyId}/simulations/${simulationId}/reject`, {
    method: 'PUT',
  });
}
