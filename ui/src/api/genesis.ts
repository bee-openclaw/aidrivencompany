import { apiFetch } from './client';

export interface GenesisResult {
  company: { id: string; name: string; description: string; mission: string };
  nodesCreated: number;
  edgesCreated: number;
  nodes: Array<{ type: string; title: string; description: string }>;
}

export function runGenesis(companyId: string, vision: string): Promise<GenesisResult> {
  return apiFetch<GenesisResult>(`/companies/${companyId}/genesis`, {
    method: 'POST',
    body: JSON.stringify({ vision }),
  });
}
