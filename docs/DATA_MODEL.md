# Data Model

This document describes the data model for AIDrivenCompany -- the Company Graph, the PostgreSQL schema that persists it, and the conventions that keep both consistent as the product evolves.

---

## 1. The Company Graph

The Company Graph is the core data structure of AIDrivenCompany. Every meaningful business concept -- an idea, a customer profile, a pricing model, a campaign -- is represented as a **node**. Relationships between concepts are represented as directed **edges**. When something changes on one node, impacts propagate outward through the graph so nothing is considered in isolation.

### 1.1 Node Types

Every node has a `type` field drawn from the set below. The `properties` JSONB column stores type-specific data, so a single `graph_nodes` table handles all of them without per-type schema sprawl.

| Node Type | Description | Key Properties |
|---|---|---|
| `idea` | Raw business idea | `title`, `description`, `status`, `origin` |
| `icp` | Ideal Customer Profile | `persona`, `demographics`, `pain_points`, `willingness_to_pay` |
| `feature` | Product feature | `name`, `description`, `priority`, `effort`, `status` |
| `pricing` | Pricing model | `type` (freemium / usage / seat / flat), `tiers`, `amounts` |
| `channel` | Go-to-market channel | `type` (email / youtube / instagram / whatsapp / paid), `reach`, `cost` |
| `campaign` | Marketing campaign | `name`, `channel`, `audience`, `content`, `budget`, `status`, `metrics` |
| `proof` | Social proof item | `type` (testimonial / case_study / review), `source`, `content`, `impact` |
| `metric` | Business metric | `name`, `type` (product / business / ai), `value`, `target`, `trend` |
| `risk` | Identified risk | `description`, `severity`, `likelihood`, `mitigation` |
| `decision` | Strategic decision | `title`, `options`, `chosen`, `rationale`, `timestamp` |
| `workflow` | Custom workflow | `name`, `steps`, `triggers`, `status` |
| `agent` | AI agent | `name`, `role`, `adapter`, `budget`, `status` |
| `goal` | Business goal | `title`, `description`, `target`, `deadline`, `status` |
| `milestone` | Project milestone | `title`, `criteria`, `deadline`, `status` |

### 1.2 Edge Types

Edges are directed (`source -> target`) and carry a `weight` (0 to 1) that indicates the strength of the relationship. Heavier weights cause larger impact propagations.

| Edge Type | Description | Example |
|---|---|---|
| `depends_on` | Hard dependency. The source cannot proceed until the target is complete. | `feature -> feature` |
| `impacts` | Change propagation. A change on the source should trigger review of the target. | `pricing -> campaign` (if pricing changes, campaigns need updating) |
| `requires` | Soft requirement. The source works better when the target exists. | `campaign -> proof` (campaigns work better with social proof) |
| `targets` | Audience targeting. The source is aimed at the target profile. | `campaign -> icp` |
| `measures` | Metric tracking. The source metric tracks the target entity. | `metric -> feature` |
| `mitigates` | Risk management. The source decision addresses the target risk. | `decision -> risk` |
| `assigned_to` | Agent assignment. The source agent is responsible for the target. | `agent -> campaign` |
| `belongs_to` | Hierarchy. The source is a child of the target. | `feature -> milestone -> goal` |

### 1.3 Change Propagation

When a node is updated, the system walks the graph to surface downstream consequences:

1. **Identify affected nodes.** Starting from the changed node, follow all outgoing `impacts` edges recursively. Track depth so direct impacts are distinguished from indirect ones.
2. **Assess each impact.** For every affected node, evaluate the significance of the change. This uses a combination of LLM reasoning and deterministic rules (edge weight, node type, current status).
3. **Generate an impact report.** The report lists every affected node with its severity (low / medium / high / critical) and a recommended action.
4. **Present to the founder.** The impact report is shown in the dashboard. The founder reviews and approves, modifies, or rejects each recommendation.
5. **Apply or reject.** Approved changes are committed to the graph. Rejected changes are logged for future reference.

This mechanism ensures that no change happens in a vacuum. Updating a pricing model, for instance, automatically surfaces every campaign and agent that may need adjustment.

---

## 2. Database Schema (PostgreSQL)

The schema is organized into logical groups: identity, graph, simulation, execution, and observability.

### 2.1 Identity and Multi-Tenancy

```sql
-- Every user in the system
users (
  id            UUID PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- A company is the top-level tenant. All data is scoped to a company.
companies (
  id            UUID PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- Many-to-many relationship between users and companies
company_memberships (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  role          TEXT NOT NULL,  -- 'owner', 'admin', 'member'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
)
```

All subsequent tables carry a `company_id` foreign key. Row-level security policies enforce tenant isolation.

### 2.2 The Company Graph

```sql
-- Every concept in the company is a node
graph_nodes (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  type          TEXT NOT NULL,         -- see Node Types above
  title         TEXT NOT NULL,
  description   TEXT,
  properties    JSONB NOT NULL DEFAULT '{}',  -- type-specific data
  status        TEXT,
  position_x    FLOAT,                 -- visual graph layout
  position_y    FLOAT,                 -- visual graph layout
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    UUID REFERENCES users(id)
)

-- Every relationship between concepts is an edge
graph_edges (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  source_node_id  UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id  UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,       -- see Edge Types above
  weight          FLOAT DEFAULT 0.5,   -- impact strength, 0 to 1
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

**Why JSONB for `properties`?** Each node type has its own shape of data. An `icp` node has `pain_points` and `willingness_to_pay`; a `campaign` node has `budget` and `content`. Using a single JSONB column avoids a proliferation of type-specific tables while still allowing indexed queries on common fields via GIN indexes.

### 2.3 Simulation

Simulations let founders ask "what if?" before committing changes. A simulation forks the current graph state, applies a hypothetical change, and reports the cascading impacts.

```sql
-- A simulation run
simulations (
  id                      UUID PRIMARY KEY,
  company_id              UUID NOT NULL REFERENCES companies(id),
  title                   TEXT NOT NULL,
  description             TEXT,
  trigger_node_id         UUID NOT NULL REFERENCES graph_nodes(id),
  trigger_change          JSONB NOT NULL,    -- the hypothetical change
  status                  TEXT NOT NULL,     -- pending, running, completed, applied, rejected
  impact_report           JSONB,             -- full report once complete
  branch_from_simulation_id UUID REFERENCES simulations(id),  -- for chained what-ifs
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by              UUID REFERENCES users(id)
)

-- Individual impacts within a simulation
simulation_impacts (
  id              UUID PRIMARY KEY,
  simulation_id   UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
  node_id         UUID NOT NULL REFERENCES graph_nodes(id),
  impact_type     TEXT NOT NULL,   -- 'direct' or 'indirect'
  severity        TEXT NOT NULL,   -- low, medium, high, critical
  description     TEXT,
  recommendation  TEXT,
  original_state  JSONB,           -- node state before the change
  proposed_state  JSONB            -- node state after the change
)
```

### 2.4 Genesis

Genesis is the onboarding flow. The founder describes their business idea, the system researches the market, and generates an initial Company Graph.

```sql
genesis_sessions (
  id                UUID PRIMARY KEY,
  company_id        UUID NOT NULL REFERENCES companies(id),
  status            TEXT NOT NULL,      -- in_progress, researching, generating, completed
  initial_input     JSONB NOT NULL,     -- what the founder provided
  research_results  JSONB,              -- market research output
  generated_graph   JSONB,              -- the initial Company Graph as JSON
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ
)
```

### 2.5 Goals, Projects, and Execution

The execution layer turns strategy into trackable work.

```sql
goals (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  title           TEXT NOT NULL,
  description     TEXT,
  target          TEXT,
  deadline        TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active',
  parent_goal_id  UUID REFERENCES goals(id)  -- goal hierarchy
)

projects (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  goal_id       UUID REFERENCES goals(id),
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
)

milestones (
  id          UUID PRIMARY KEY,
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  criteria    TEXT,
  deadline    TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'pending'
)

issues (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  project_id      UUID REFERENCES projects(id),
  milestone_id    UUID REFERENCES milestones(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'open',
  assignee_type   TEXT,         -- 'user' or 'agent'
  assignee_id     UUID,         -- references users(id) or agents(id)
  priority        TEXT DEFAULT 'medium'
)
```

### 2.6 Agents

AI agents perform work autonomously within defined budgets and roles.

```sql
agents (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL,
  adapter_type    TEXT NOT NULL,         -- which AI/API adapter to use
  config          JSONB DEFAULT '{}',   -- adapter-specific configuration
  budget_monthly  DECIMAL(10,2),
  budget_used     DECIMAL(10,2) DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
)

-- Each time an agent runs its heartbeat cycle
agent_heartbeat_runs (
  id            UUID PRIMARY KEY,
  agent_id      UUID NOT NULL REFERENCES agents(id),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  status        TEXT NOT NULL,     -- running, completed, failed
  summary       TEXT,
  cost          DECIMAL(10,4)
)
```

**Why JSONB for `config`?** Agent adapters vary widely. An email agent needs SMTP credentials and templates; a YouTube agent needs API keys and channel IDs. JSONB lets each adapter define its own configuration shape without schema changes.

### 2.7 Campaigns and Go-to-Market

```sql
campaigns (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  node_id       UUID REFERENCES graph_nodes(id),  -- link back to graph
  channel       TEXT NOT NULL,
  name          TEXT NOT NULL,
  audience      JSONB,           -- targeting criteria
  content       JSONB,           -- structured content (subject, body, images, CTAs)
  budget        DECIMAL(10,2),
  spent         DECIMAL(10,2) DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft',
  metrics       JSONB DEFAULT '{}',  -- flexible metric tracking (opens, clicks, conversions)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ
)
```

**Why JSONB for `content` and `metrics`?** Campaign content varies by channel -- an email campaign has a subject line and body; an Instagram campaign has images and captions. Similarly, metrics differ by channel. JSONB accommodates this without forcing a lowest-common-denominator schema.

### 2.8 Social Proof

```sql
proof_items (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  node_id       UUID REFERENCES graph_nodes(id),
  type          TEXT NOT NULL,       -- testimonial, case_study, review
  source        TEXT,                -- where it came from
  content       TEXT NOT NULL,
  impact_score  FLOAT,               -- how impactful (0 to 1)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### 2.9 Metrics

```sql
-- Time-series metric snapshots
metric_snapshots (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  node_id       UUID REFERENCES graph_nodes(id),
  name          TEXT NOT NULL,
  value         FLOAT NOT NULL,
  target        FLOAT,
  unit          TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### 2.10 Decisions

```sql
decisions (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  node_id         UUID REFERENCES graph_nodes(id),
  title           TEXT NOT NULL,
  options         JSONB NOT NULL,      -- array of option objects
  chosen_option   TEXT,
  rationale       TEXT,
  simulation_id   UUID REFERENCES simulations(id),  -- if backed by a simulation
  decided_at      TIMESTAMPTZ,
  decided_by      UUID REFERENCES users(id)
)
```

### 2.11 Cost Tracking

Every LLM call, API request, or paid action is recorded as a cost event.

```sql
cost_events (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  agent_id      UUID REFERENCES agents(id),
  amount        DECIMAL(10,6) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  provider      TEXT NOT NULL,         -- openai, anthropic, etc.
  model         TEXT,
  tokens_in     INTEGER,
  tokens_out    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### 2.12 Approvals

Certain actions require founder approval before they execute.

```sql
approvals (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  type            TEXT NOT NULL,         -- what kind of approval
  entity_id       UUID NOT NULL,         -- what entity needs approval
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  requested_by    UUID,
  decided_by      UUID REFERENCES users(id),
  decided_at      TIMESTAMPTZ,
  notes           TEXT
)
```

### 2.13 Activity Log

An append-only audit trail of everything that happens in a company.

```sql
activity_log (
  id            UUID PRIMARY KEY,
  company_id    UUID NOT NULL REFERENCES companies(id),
  actor_type    TEXT NOT NULL,     -- 'user', 'agent', 'system'
  actor_id      UUID,
  action        TEXT NOT NULL,     -- 'created', 'updated', 'deleted', 'approved', etc.
  entity_type   TEXT NOT NULL,     -- 'graph_node', 'campaign', 'decision', etc.
  entity_id     UUID NOT NULL,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### 2.14 Company Secrets

Encrypted storage for API keys, credentials, and other sensitive values.

```sql
company_secrets (
  id              UUID PRIMARY KEY,
  company_id      UUID NOT NULL REFERENCES companies(id),
  key             TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, key)
)
```

### 2.15 Plugin System

```sql
plugins (
  id        UUID PRIMARY KEY,
  name      TEXT UNIQUE NOT NULL,
  version   TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'active',
  config    JSONB DEFAULT '{}'
)

-- Per-company plugin state
plugin_state (
  id          UUID PRIMARY KEY,
  plugin_id   UUID NOT NULL REFERENCES plugins(id),
  company_id  UUID NOT NULL REFERENCES companies(id),
  key         TEXT NOT NULL,
  value       JSONB,
  UNIQUE (plugin_id, company_id, key)
)
```

---

## 3. Indexes

These indexes support the most common query patterns. All tables with `company_id` have composite indexes that start with `company_id` for tenant-scoped queries.

| Table | Index | Rationale |
|---|---|---|
| `graph_nodes` | `(company_id, type)` | Filter nodes by type within a company (e.g., all features) |
| `graph_nodes` | `(company_id, status)` | Filter nodes by status (e.g., all active nodes) |
| `graph_edges` | `(company_id, source_node_id)` | Find all outgoing edges from a node |
| `graph_edges` | `(company_id, target_node_id)` | Find all incoming edges to a node |
| `graph_edges` | `(source_node_id, type)` | Walk the graph by edge type (e.g., all `impacts` edges from a node) |
| `simulations` | `(company_id, status)` | List pending or running simulations |
| `cost_events` | `(company_id, agent_id, created_at)` | Cost reports per agent over time |
| `activity_log` | `(company_id, created_at)` | Chronological activity feed |
| `metric_snapshots` | `(company_id, node_id, recorded_at)` | Time-series queries for a specific metric |

Additional GIN indexes on JSONB columns (e.g., `graph_nodes.properties`, `campaigns.metrics`) can be added as query patterns emerge.

---

## 4. JSONB Column Summary

JSONB is used deliberately in places where the schema would otherwise require either many sparse columns or many type-specific tables. The tradeoffs are accepted: slightly more complex queries in exchange for significant schema flexibility.

| Table | Column | Why JSONB |
|---|---|---|
| `graph_nodes` | `properties` | Each node type has different properties. An `icp` has `pain_points`; a `feature` has `effort`. JSONB avoids a table-per-type explosion. |
| `graph_edges` | `metadata` | Edge-specific context that varies by relationship type. |
| `agents` | `config` | Adapter-specific configuration. An email adapter and a YouTube adapter need completely different settings. |
| `campaigns` | `audience` | Targeting criteria vary by channel and ICP. |
| `campaigns` | `content` | Content structure differs by channel (email has subject/body; social has images/captions). |
| `campaigns` | `metrics` | Tracked metrics differ by channel (email has open rates; paid ads have CPC). |
| `simulations` | `trigger_change` | The hypothetical change being simulated -- could be any subset of node properties. |
| `simulations` | `impact_report` | Structured report generated by the simulation engine. |
| `genesis_sessions` | `initial_input` | Freeform founder input during onboarding. |
| `genesis_sessions` | `research_results` | Market research output with variable structure. |
| `genesis_sessions` | `generated_graph` | Serialized graph before it is committed to `graph_nodes` and `graph_edges`. |
| `decisions` | `options` | Array of option objects, each with different attributes. |
| `activity_log` | `metadata` | Action-specific context (e.g., which fields changed, old/new values). |
| `plugin_state` | `value` | Plugin-defined state with no predictable shape. |

---

## 5. Migration Strategy

- **ORM:** Drizzle ORM is used to define the schema in TypeScript and generate SQL migrations.
- **Forward-only:** Migrations in production are always forward-only. Rollbacks are handled by deploying a new forward migration that reverses the change.
- **Development seeds:** Seed scripts populate a local database with realistic test data -- a sample company, graph nodes of each type, edges, a few simulations, and cost events.
- **JSONB validation:** While the database does not enforce JSONB shape, application-level Zod schemas validate the contents of every JSONB column before writes. This gives the flexibility of schemaless storage with the safety of typed validation.

---

## 6. Entity Relationship Overview

```
users ─────────────── company_memberships ─────────────── companies
                                                              │
          ┌───────────────────────────────────────────────────┤
          │                                                   │
     graph_nodes ◄──────── graph_edges ────────► graph_nodes  │
          │                                                   │
          ├── simulations ──── simulation_impacts              │
          │                                                   │
          ├── campaigns                                        │
          ├── proof_items                                      │
          ├── metric_snapshots                                 │
          ├── decisions                                        │
          │                                                   │
          │   goals ── projects ── milestones ── issues        │
          │                                                   │
          │   agents ── agent_heartbeat_runs                   │
          │          └── cost_events                           │
          │                                                   │
          │   genesis_sessions                                 │
          │   approvals                                        │
          │   activity_log                                     │
          │   company_secrets                                  │
          └── plugins ── plugin_state                          │
                                                              │
```

The `graph_nodes` table is central. Many tables (`campaigns`, `proof_items`, `metric_snapshots`, `decisions`) carry a `node_id` foreign key linking them back to a graph node. This duality -- structured relational data plus a flexible graph -- lets the system support both precise queries ("show me all campaigns for this ICP") and exploratory graph traversals ("what would change if we dropped this feature?").
