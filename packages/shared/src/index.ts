// Shared types for AIDrivenCompany

// === Node Types ===
export const NODE_TYPES = [
  'idea', 'icp', 'feature', 'pricing', 'channel',
  'campaign', 'proof', 'metric', 'risk', 'decision',
  'workflow', 'agent', 'goal', 'milestone',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

// === Edge Types ===
export const EDGE_TYPES = [
  'depends_on', 'impacts', 'requires', 'targets',
  'measures', 'mitigates', 'assigned_to', 'belongs_to',
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

// === Status Types ===
export type CompanyStatus = 'active' | 'archived' | 'draft';
export type NodeStatus = 'active' | 'draft' | 'archived' | 'simulated';
export type SimulationStatus = 'pending' | 'running' | 'completed' | 'applied' | 'rejected';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type AgentStatus = 'idle' | 'running' | 'paused' | 'error';
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type SimulationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ProofType = 'testimonial' | 'case_study' | 'review';
export type ChannelType = 'email' | 'youtube' | 'instagram' | 'whatsapp' | 'paid' | 'field' | 'linkedin' | 'twitter';

// === Core Entities ===
export interface Company {
  id: string;
  name: string;
  description: string;
  mission?: string;
  logoUrl?: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GraphNode {
  id: string;
  companyId: string;
  type: NodeType;
  title: string;
  description: string;
  properties: Record<string, unknown>;
  status: NodeStatus;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
}

export interface GraphEdge {
  id: string;
  companyId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EdgeType;
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Simulation {
  id: string;
  companyId: string;
  title: string;
  description: string;
  triggerNodeId: string;
  triggerChange: Record<string, unknown>;
  status: SimulationStatus;
  impactReport: SimulationImpact[];
  createdAt: string;
  createdBy: string;
}

export interface SimulationImpact {
  nodeId: string;
  nodeTitle: string;
  nodeType: NodeType;
  impactType: 'direct' | 'indirect';
  severity: SimulationSeverity;
  description: string;
  recommendation: string;
}

export interface Campaign {
  id: string;
  companyId: string;
  nodeId?: string;
  channel: ChannelType;
  name: string;
  audience: Record<string, unknown>;
  content: Record<string, unknown>;
  budget: number;
  spent: number;
  status: CampaignStatus;
  metrics: Record<string, number>;
  createdAt: string;
}

export interface ProofItem {
  id: string;
  companyId: string;
  nodeId?: string;
  type: ProofType;
  source: string;
  content: string;
  impactScore: number;
  createdAt: string;
}

export interface MetricSnapshot {
  id: string;
  companyId: string;
  nodeId?: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  recordedAt: string;
}

export interface Decision {
  id: string;
  companyId: string;
  nodeId?: string;
  title: string;
  options: { label: string; description: string }[];
  chosenOption: string;
  rationale: string;
  simulationId?: string;
  decidedAt: string;
}

export interface ActivityEntry {
  id: string;
  companyId: string;
  actorType: 'user' | 'agent' | 'system';
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// === API Types ===
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// === Dashboard ===
export interface DashboardData {
  company: Company;
  stats: {
    totalNodes: number;
    activeSimulations: number;
    activeCampaigns: number;
    totalProof: number;
    totalDecisions: number;
  };
  recentActivity: ActivityEntry[];
  metrics: MetricSnapshot[];
  pendingDecisions: Decision[];
}
