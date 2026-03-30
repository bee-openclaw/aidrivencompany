import type { ProofItem } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export function fetchProof(companyId: string): Promise<ProofItem[]> {
  return apiFetch<ProofItem[]>(`/companies/${companyId}/proof`);
}
