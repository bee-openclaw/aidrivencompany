import type Database from 'better-sqlite3';
import crypto from 'node:crypto';

// ── Helpers ──────────────────────────────────────────────────────────

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface RawRow {
  [key: string]: unknown;
}

function toCompany(row: RawRow) {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    mission: row.mission as string | undefined,
    logoUrl: row.logo_url as string | undefined,
    status: row.status as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toNode(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    type: row.type as string,
    title: row.title as string,
    description: row.description as string,
    properties: parseJson(row.properties as string, {}),
    status: row.status as string,
    positionX: row.position_x as number,
    positionY: row.position_y as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toEdge(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    sourceNodeId: row.source_node_id as string,
    targetNodeId: row.target_node_id as string,
    type: row.type as string,
    weight: row.weight as number,
    metadata: parseJson(row.metadata as string, {}),
    createdAt: row.created_at as string,
  };
}

function toSimulation(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    title: row.title as string,
    description: row.description as string,
    triggerNodeId: row.trigger_node_id as string,
    triggerChange: parseJson(row.trigger_change as string, {}),
    status: row.status as string,
    impactReport: parseJson(row.impact_report as string, []),
    createdAt: row.created_at as string,
    createdBy: row.created_by as string,
  };
}

function toCampaign(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    nodeId: row.node_id as string | undefined,
    channel: row.channel as string,
    name: row.name as string,
    audience: parseJson(row.audience as string, {}),
    content: parseJson(row.content as string, {}),
    budget: row.budget as number,
    spent: row.spent as number,
    status: row.status as string,
    metrics: parseJson(row.metrics as string, {}),
    createdAt: row.created_at as string,
  };
}

function toProofItem(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    nodeId: row.node_id as string | undefined,
    type: row.type as string,
    source: row.source as string,
    content: row.content as string,
    impactScore: row.impact_score as number,
    createdAt: row.created_at as string,
  };
}

function toMetricSnapshot(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    nodeId: row.node_id as string | undefined,
    name: row.name as string,
    value: row.value as number,
    target: row.target as number,
    unit: row.unit as string,
    recordedAt: row.recorded_at as string,
  };
}

function toDecision(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    nodeId: row.node_id as string | undefined,
    title: row.title as string,
    options: parseJson(row.options as string, []),
    chosenOption: row.chosen_option as string | undefined,
    rationale: row.rationale as string,
    simulationId: row.simulation_id as string | undefined,
    decidedAt: row.decided_at as string,
  };
}

function toActivity(row: RawRow) {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    actorType: row.actor_type as string,
    actorId: row.actor_id as string,
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string,
    metadata: parseJson(row.metadata as string, {}),
    createdAt: row.created_at as string,
  };
}

// ── Companies ────────────────────────────────────────────────────────

export function getCompanies(db: Database.Database) {
  const rows = db.prepare('SELECT * FROM companies ORDER BY created_at DESC').all() as RawRow[];
  return rows.map(toCompany);
}

export function getCompany(db: Database.Database, id: string) {
  const row = db.prepare('SELECT * FROM companies WHERE id = ?').get(id) as RawRow | undefined;
  return row ? toCompany(row) : null;
}

export function createCompany(
  db: Database.Database,
  data: { name: string; description: string; mission?: string; logoUrl?: string; status?: string },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO companies (id, name, description, mission, logo_url, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, data.name, data.description, data.mission ?? null, data.logoUrl ?? null, data.status ?? 'active', now, now);
  return getCompany(db, id)!;
}

// ── Graph Nodes ──────────────────────────────────────────────────────

export function getNodes(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM graph_nodes WHERE company_id = ? ORDER BY created_at').all(companyId) as RawRow[];
  return rows.map(toNode);
}

export function getNode(db: Database.Database, id: string) {
  const row = db.prepare('SELECT * FROM graph_nodes WHERE id = ?').get(id) as RawRow | undefined;
  return row ? toNode(row) : null;
}

export function createNode(
  db: Database.Database,
  data: {
    companyId: string;
    type: string;
    title: string;
    description?: string;
    properties?: Record<string, unknown>;
    status?: string;
    positionX?: number;
    positionY?: number;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO graph_nodes (id, company_id, type, title, description, properties, status, position_x, position_y, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.companyId,
    data.type,
    data.title,
    data.description ?? '',
    JSON.stringify(data.properties ?? {}),
    data.status ?? 'active',
    data.positionX ?? 0,
    data.positionY ?? 0,
    now,
    now,
  );
  return getNode(db, id)!;
}

export function updateNode(
  db: Database.Database,
  id: string,
  data: {
    title?: string;
    description?: string;
    properties?: Record<string, unknown>;
    status?: string;
    positionX?: number;
    positionY?: number;
  },
) {
  const existing = getNode(db, id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE graph_nodes SET
       title = ?, description = ?, properties = ?, status = ?,
       position_x = ?, position_y = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    data.title ?? existing.title,
    data.description ?? existing.description,
    JSON.stringify(data.properties ?? existing.properties),
    data.status ?? existing.status,
    data.positionX ?? existing.positionX,
    data.positionY ?? existing.positionY,
    now,
    id,
  );
  return getNode(db, id)!;
}

// ── Graph Edges ──────────────────────────────────────────────────────

export function getEdges(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM graph_edges WHERE company_id = ? ORDER BY created_at').all(companyId) as RawRow[];
  return rows.map(toEdge);
}

export function createEdge(
  db: Database.Database,
  data: {
    companyId: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: string;
    weight?: number;
    metadata?: Record<string, unknown>;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO graph_edges (id, company_id, source_node_id, target_node_id, type, weight, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, data.companyId, data.sourceNodeId, data.targetNodeId, data.type, data.weight ?? 1.0, JSON.stringify(data.metadata ?? {}), now);
  return db.prepare('SELECT * FROM graph_edges WHERE id = ?').get(id) as RawRow;
}

export function getNodeWithEdges(db: Database.Database, nodeId: string) {
  const node = getNode(db, nodeId);
  if (!node) return null;
  const outgoing = (db.prepare('SELECT * FROM graph_edges WHERE source_node_id = ?').all(nodeId) as RawRow[]).map(toEdge);
  const incoming = (db.prepare('SELECT * FROM graph_edges WHERE target_node_id = ?').all(nodeId) as RawRow[]).map(toEdge);
  return { ...node, edges: { outgoing, incoming } };
}

// ── Simulations ──────────────────────────────────────────────────────

export function getSimulations(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM simulations WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as RawRow[];
  return rows.map(toSimulation);
}

export function createSimulation(
  db: Database.Database,
  data: {
    companyId: string;
    title: string;
    description?: string;
    triggerNodeId: string;
    triggerChange: Record<string, unknown>;
    impactReport?: unknown[];
    status?: string;
    createdBy?: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO simulations (id, company_id, title, description, trigger_node_id, trigger_change, status, impact_report, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.companyId,
    data.title,
    data.description ?? '',
    data.triggerNodeId,
    JSON.stringify(data.triggerChange),
    data.status ?? 'completed',
    JSON.stringify(data.impactReport ?? []),
    now,
    data.createdBy ?? 'user',
  );
  const row = db.prepare('SELECT * FROM simulations WHERE id = ?').get(id) as RawRow;
  return toSimulation(row);
}

export function updateSimulationStatus(db: Database.Database, id: string, status: string) {
  db.prepare('UPDATE simulations SET status = ? WHERE id = ?').run(status, id);
  const row = db.prepare('SELECT * FROM simulations WHERE id = ?').get(id) as RawRow | undefined;
  return row ? toSimulation(row) : null;
}

// ── Campaigns ────────────────────────────────────────────────────────

export function getCampaigns(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM campaigns WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as RawRow[];
  return rows.map(toCampaign);
}

export function createCampaign(
  db: Database.Database,
  data: {
    companyId: string;
    nodeId?: string;
    channel: string;
    name: string;
    audience?: Record<string, unknown>;
    content?: Record<string, unknown>;
    budget?: number;
    spent?: number;
    status?: string;
    metrics?: Record<string, number>;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO campaigns (id, company_id, node_id, channel, name, audience, content, budget, spent, status, metrics, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.companyId,
    data.nodeId ?? null,
    data.channel,
    data.name,
    JSON.stringify(data.audience ?? {}),
    JSON.stringify(data.content ?? {}),
    data.budget ?? 0,
    data.spent ?? 0,
    data.status ?? 'draft',
    JSON.stringify(data.metrics ?? {}),
    now,
  );
  const row = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id) as RawRow;
  return toCampaign(row);
}

// ── Proof Items ──────────────────────────────────────────────────────

export function getProofItems(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM proof_items WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as RawRow[];
  return rows.map(toProofItem);
}

export function createProofItem(
  db: Database.Database,
  data: {
    companyId: string;
    nodeId?: string;
    type: string;
    source: string;
    content: string;
    impactScore?: number;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO proof_items (id, company_id, node_id, type, source, content, impact_score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, data.companyId, data.nodeId ?? null, data.type, data.source, data.content, data.impactScore ?? 0, now);
  const row = db.prepare('SELECT * FROM proof_items WHERE id = ?').get(id) as RawRow;
  return toProofItem(row);
}

// ── Metric Snapshots ─────────────────────────────────────────────────

export function getMetrics(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM metric_snapshots WHERE company_id = ? ORDER BY recorded_at DESC').all(companyId) as RawRow[];
  return rows.map(toMetricSnapshot);
}

export function createMetricSnapshot(
  db: Database.Database,
  data: {
    companyId: string;
    nodeId?: string;
    name: string;
    value: number;
    target: number;
    unit: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO metric_snapshots (id, company_id, node_id, name, value, target, unit, recorded_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, data.companyId, data.nodeId ?? null, data.name, data.value, data.target, data.unit, now);
  const row = db.prepare('SELECT * FROM metric_snapshots WHERE id = ?').get(id) as RawRow;
  return toMetricSnapshot(row);
}

// ── Decisions ────────────────────────────────────────────────────────

export function getDecisions(db: Database.Database, companyId: string) {
  const rows = db.prepare('SELECT * FROM decisions WHERE company_id = ? ORDER BY decided_at DESC').all(companyId) as RawRow[];
  return rows.map(toDecision);
}

export function createDecision(
  db: Database.Database,
  data: {
    companyId: string;
    nodeId?: string;
    title: string;
    options: { label: string; description: string }[];
    chosenOption?: string;
    rationale: string;
    simulationId?: string;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO decisions (id, company_id, node_id, title, options, chosen_option, rationale, simulation_id, decided_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.companyId,
    data.nodeId ?? null,
    data.title,
    JSON.stringify(data.options),
    data.chosenOption ?? null,
    data.rationale,
    data.simulationId ?? null,
    now,
  );
  const row = db.prepare('SELECT * FROM decisions WHERE id = ?').get(id) as RawRow;
  return toDecision(row);
}

// ── Activity Log ─────────────────────────────────────────────────────

export function getActivity(db: Database.Database, companyId: string, limit = 50) {
  const rows = db
    .prepare('SELECT * FROM activity_log WHERE company_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(companyId, limit) as RawRow[];
  return rows.map(toActivity);
}

export function createActivity(
  db: Database.Database,
  data: {
    companyId: string;
    actorType: string;
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
  },
) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO activity_log (id, company_id, actor_type, actor_id, action, entity_type, entity_id, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, data.companyId, data.actorType, data.actorId, data.action, data.entityType, data.entityId, JSON.stringify(data.metadata ?? {}), now);
  const row = db.prepare('SELECT * FROM activity_log WHERE id = ?').get(id) as RawRow;
  return toActivity(row);
}

// ── Settings ─────────────────────────────────────────────────────────

export function getSetting(db: Database.Database, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(db: Database.Database, key: string, value: string): void {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run(key, value, now);
}

export function getSettings(db: Database.Database): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

// ── Dashboard Stats ──────────────────────────────────────────────────

export function getDashboardStats(db: Database.Database, companyId: string) {
  const totalNodes = (db.prepare('SELECT COUNT(*) as count FROM graph_nodes WHERE company_id = ?').get(companyId) as { count: number }).count;
  const activeSimulations = (
    db.prepare("SELECT COUNT(*) as count FROM simulations WHERE company_id = ? AND status IN ('pending', 'running')").get(companyId) as {
      count: number;
    }
  ).count;
  const activeCampaigns = (
    db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE company_id = ? AND status IN ('active', 'scheduled')").get(companyId) as {
      count: number;
    }
  ).count;
  const totalProof = (db.prepare('SELECT COUNT(*) as count FROM proof_items WHERE company_id = ?').get(companyId) as { count: number }).count;
  const totalDecisions = (db.prepare('SELECT COUNT(*) as count FROM decisions WHERE company_id = ?').get(companyId) as { count: number }).count;

  return {
    totalNodes,
    activeSimulations,
    activeCampaigns,
    totalProof,
    totalDecisions,
  };
}
