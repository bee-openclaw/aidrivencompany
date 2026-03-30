import type { GraphNode, GraphEdge } from '@aidrivencompany/shared';
import { apiFetch } from './client';

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function fetchGraph(companyId: string): Promise<GraphData> {
  return apiFetch<GraphData>(`/companies/${companyId}/graph`);
}
