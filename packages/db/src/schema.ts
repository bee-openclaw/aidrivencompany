import Database from 'better-sqlite3';

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    mission TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS graph_nodes (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    properties TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    position_x REAL NOT NULL DEFAULT 0,
    position_y REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS graph_edges (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    source_node_id TEXT NOT NULL REFERENCES graph_nodes(id),
    target_node_id TEXT NOT NULL REFERENCES graph_nodes(id),
    type TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS simulations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    trigger_node_id TEXT REFERENCES graph_nodes(id),
    trigger_change TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending',
    impact_report TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL DEFAULT 'user'
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    node_id TEXT REFERENCES graph_nodes(id),
    channel TEXT NOT NULL,
    name TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT '{}',
    content TEXT NOT NULL DEFAULT '{}',
    budget REAL NOT NULL DEFAULT 0,
    spent REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    metrics TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS proof_items (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    node_id TEXT REFERENCES graph_nodes(id),
    type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    impact_score REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS metric_snapshots (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    node_id TEXT REFERENCES graph_nodes(id),
    name TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0,
    target REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    node_id TEXT REFERENCES graph_nodes(id),
    title TEXT NOT NULL,
    options TEXT NOT NULL DEFAULT '[]',
    chosen_option TEXT,
    rationale TEXT NOT NULL DEFAULT '',
    simulation_id TEXT REFERENCES simulations(id),
    decided_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    actor_type TEXT NOT NULL DEFAULT 'system',
    actor_id TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL DEFAULT '',
    entity_id TEXT NOT NULL DEFAULT '',
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_graph_nodes_company ON graph_nodes(company_id);
  CREATE INDEX IF NOT EXISTS idx_graph_edges_company ON graph_edges(company_id);
  CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source_node_id);
  CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target_node_id);
  CREATE INDEX IF NOT EXISTS idx_simulations_company ON simulations(company_id);
  CREATE INDEX IF NOT EXISTS idx_campaigns_company ON campaigns(company_id);
  CREATE INDEX IF NOT EXISTS idx_proof_items_company ON proof_items(company_id);
  CREATE INDEX IF NOT EXISTS idx_metric_snapshots_company ON metric_snapshots(company_id);
  CREATE INDEX IF NOT EXISTS idx_decisions_company ON decisions(company_id);
  CREATE INDEX IF NOT EXISTS idx_activity_log_company ON activity_log(company_id);
`;

export function initDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create all tables
  db.exec(CREATE_TABLES_SQL);

  return db;
}
