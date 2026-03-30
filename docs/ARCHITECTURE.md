# AIDrivenCompany Architecture

> Technical blueprint for contributors (human and AI).
> Open source (MIT) + hosted.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Tech Stack](#tech-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Company Graph Engine](#company-graph-engine)
6. [Simulation Engine](#simulation-engine)
7. [Genesis System](#genesis-system)
8. [Orchestration Layer](#orchestration-layer)
9. [Execution Layer](#execution-layer)
10. [Real-Time System](#real-time-system)
11. [Multi-Tenancy](#multi-tenancy)
12. [API Design](#api-design)
13. [Plugin System](#plugin-system)
14. [Data Model](#data-model)
15. [Deployment](#deployment)

---

## System Overview

AIDrivenCompany is a Company OS -- a system that lets AI agents build, run, and evolve a company under human governance. It operates across three layers:

```
+---------------------------------------------------------------+
|                      STRATEGY LAYER                           |
|  Genesis | Simulation Engine | Company Graph | CEO Dashboard  |
+---------------------------------------------------------------+
|                    ORCHESTRATION LAYER                         |
|  Agent Registry | Roles & Budgets | Goals | Governance |      |
|  Heartbeats | Approval Gates | Cost Tracking                 |
+---------------------------------------------------------------+
|                      EXECUTION LAYER                          |
|  Agent Adapters | Channel Integrations | Campaign Engine |    |
|  Proof Collection | Metrics & Feedback                        |
+---------------------------------------------------------------+
```

**Strategy** defines what the company is and could become.
**Orchestration** manages who does what, when, and within what constraints.
**Execution** carries out the work across real-world channels.

---

## High-Level Architecture

```
                          +-----------+
                          |  Browser  |
                          | (React +  |
                          |  Vite)    |
                          +-----+-----+
                                |
                          HTTP / WS
                                |
                          +-----v-----+
                          |  Express  |
                          |  Server   |
                          +-----+-----+
                                |
              +-----------------+------------------+
              |                 |                   |
        +-----v-----+   +------v------+   +--------v--------+
        |  Company   |   | Simulation  |   |  Orchestration  |
        |  Graph     |   | Engine      |   |  (Agents, Goals |
        |  Engine    |   |             |   |   Governance)   |
        +-----+------+   +------+------+   +--------+--------+
              |                  |                   |
              +------------------+-------------------+
                                 |
                          +------v------+
                          | PostgreSQL  |
                          | (Drizzle)   |
                          +-------------+
```

---

## Tech Stack

| Concern         | Choice                                      |
|-----------------|---------------------------------------------|
| Monorepo        | pnpm workspaces                             |
| Language        | TypeScript throughout                       |
| Runtime         | Node.js 22+                                 |
| Server          | Express.js                                  |
| Real-time       | WebSocket (ws)                              |
| Database        | PostgreSQL + Drizzle ORM (SQLite for local) |
| Frontend        | React + Vite + Tailwind CSS + shadcn/ui     |
| Build (server)  | esbuild                                     |
| Build (UI)      | Vite                                        |
| Testing (unit)  | Vitest                                      |
| Testing (E2E)   | Playwright                                  |
| Auth            | Better Auth (multi-user, multi-company)     |
| Deploy          | Docker + docker-compose, Fly.io / Railway   |

---

## Monorepo Structure

```
aidrivencompany/
  server/                      Express API server
    src/
      routes/                  REST API endpoints
      services/                Business logic
      middleware/              Auth, validation, error handling
      graph/                   Company Graph engine
      simulation/             Simulation engine
      genesis/                Genesis agent (idea -> company)

  ui/                          React frontend
    src/
      pages/                   Page components
      components/              Reusable UI components
      api/                     Typed API clients
      hooks/                   Custom React hooks
      context/                 React context providers

  packages/
    db/                        Drizzle schema + migrations
    shared/                    Shared types + utilities
    adapters/                  Agent adapters (Claude, Codex, OpenClaw, etc.)
    plugins/                   Plugin SDK and runtime

  cli/                         CLI tool
  docs/                        Documentation
  docker/                      Docker configs
  scripts/                     Build and utility scripts
```

Package dependency graph:

```
  ui -----> shared
   \           ^
    \          |
     +---> server ---> db
              |         ^
              v         |
           adapters     |
              |         |
              +---------+
           plugins ---> shared
```

---

## Company Graph Engine

The Company Graph is the central data structure. It is a directed graph where every meaningful business concept is a node and every relationship is an edge.

### Node Types

```
  idea --> icp --> problem --> wedge --> features
                                           |
                                           v
                               pricing --> channels --> campaigns --> proof --> metrics
```

| Node Type   | Description                                |
|-------------|--------------------------------------------|
| `idea`      | The core business idea                     |
| `icp`       | Ideal Customer Profile                     |
| `problem`   | Customer pain point                        |
| `wedge`     | Initial market entry angle                 |
| `features`  | Product capabilities                       |
| `pricing`   | Revenue model and pricing tiers            |
| `channels`  | Distribution and acquisition channels      |
| `campaigns` | Marketing and outreach campaigns           |
| `proof`     | Testimonials, case studies, social proof   |
| `metrics`   | KPIs, OKRs, health indicators              |

### Edge Types

| Edge Type     | Meaning                                      |
|---------------|----------------------------------------------|
| `depends_on`  | Target must exist/be valid for source to work |
| `impacts`     | Changes to source propagate to target         |
| `requires`    | Source cannot function without target          |

### Storage

The graph is stored in PostgreSQL using two patterns:

- **Adjacency list** for traversal queries (find neighbors, BFS/DFS).
- **Materialized paths** for fast subtree queries (find all descendants).

```sql
-- Simplified schema
CREATE TABLE graph_nodes (
    id          UUID PRIMARY KEY,
    company_id  UUID NOT NULL,
    type        VARCHAR(32) NOT NULL,      -- 'idea', 'icp', 'features', ...
    label       TEXT NOT NULL,
    data        JSONB NOT NULL DEFAULT '{}',
    path        TEXT NOT NULL,             -- materialized path
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE graph_edges (
    id          UUID PRIMARY KEY,
    company_id  UUID NOT NULL,
    source_id   UUID NOT NULL REFERENCES graph_nodes(id),
    target_id   UUID NOT NULL REFERENCES graph_nodes(id),
    type        VARCHAR(32) NOT NULL,      -- 'depends_on', 'impacts', 'requires'
    weight      REAL DEFAULT 1.0,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Change Propagation

When a node is updated, the graph engine:

1. Identifies all outgoing `impacts` edges from the changed node.
2. Performs a BFS traversal to collect the full impact set.
3. Marks affected nodes as `stale`.
4. Optionally triggers a simulation for the change.

```
  [pricing changed]
        |
        v
  traverse impacts edges
        |
        +---> channels (stale)
        |        +---> campaigns (stale)
        |                 +---> metrics (stale)
        +---> features (stale)
```

---

## Simulation Engine

The Simulation Engine answers "what if" questions by combining graph traversal with LLM analysis.

### Flow

```
  +----------------+     +-----------------+     +------------------+
  | Proposed       |---->| Graph Traversal |---->| Impact Analysis  |
  | Change         |     | (find affected  |     | (LLM generates   |
  | (user/agent)   |     |  nodes)         |     |  tradeoffs,      |
  +----------------+     +-----------------+     |  risks, recs)    |
                                                 +--------+---------+
                                                          |
                                              +-----------+-----------+
                                              |                       |
                                        +-----v-----+          +-----v-----+
                                        |   Apply   |          |  Reject   |
                                        | (commit   |          | (discard) |
                                        |  changes) |          |           |
                                        +-----------+          +-----------+
```

### Branching

Simulations support branching to explore multiple scenarios in parallel:

```
                    base state
                        |
              +---------+---------+
              |                   |
        branch A            branch B
   "freemium model"    "usage-based model"
              |                   |
        impact report       impact report
              |                   |
         compare & choose
```

Each branch is an isolated copy of the affected subgraph. Applying a branch merges its changes back into the main graph.

### Simulation Record

Every simulation is persisted:

- **Input**: the proposed change and affected scope.
- **Output**: impact analysis, risk assessment, recommendations.
- **Decision**: applied, rejected, or deferred.
- **Timestamp and actor**: who initiated, who decided.

---

## Genesis System

Genesis supports founders starting from zero -- no idea, no plan. An AI agent performs structured research and outputs a complete company definition.

### Genesis Pipeline

```
  [start: founder prompt or blank]
        |
        v
  +------------------+
  | Market Research   |  Identify opportunities, trends, gaps
  +--------+---------+
           |
           v
  +------------------+
  | ICP Discovery     |  Define ideal customer profiles
  +--------+---------+
           |
           v
  +------------------+
  | Wedge Definition  |  Find the initial entry point
  +--------+---------+
           |
           v
  +------------------+
  | Problem Validation|  Validate that the pain is real
  +--------+---------+
           |
           v
  +------------------+
  | Product Shape     |  Define MVP features and scope
  +--------+---------+
           |
           v
  +------------------+
  | GTM Strategy      |  Channels, campaigns, positioning
  +--------+---------+
           |
           v
  +------------------+
  | Risk Analysis     |  Identify threats and mitigations
  +--------+---------+
           |
           v
  [output: Company Graph + company definition]
```

Each stage produces nodes that are wired into the Company Graph. The output is a fully populated graph ready for simulation, iteration, and execution.

---

## Orchestration Layer

The Orchestration Layer manages AI agents, goals, budgets, and governance. Inspired by Paperclip's architecture.

### Agent Registry

Every agent is registered with:

```
Agent {
    id:          UUID
    company_id:  UUID
    name:        string           -- "content-writer", "outbound-sales"
    adapter:     string           -- "claude", "codex", "openclaw"
    role:        string           -- "engineer", "marketer", "researcher"
    permissions: Permission[]     -- what the agent can do
    budget:      Budget           -- spending limits (tokens, dollars, actions)
    status:      "active" | "paused" | "terminated"
}
```

### Goal Hierarchy

Goals form a strict hierarchy:

```
  Mission
    |
    +-- Initiative
          |
          +-- Project
                |
                +-- Milestone
                      |
                      +-- Task (assigned to agent)
```

Each level has:
- **Owner**: human or agent responsible.
- **Status**: `draft`, `active`, `blocked`, `complete`, `failed`.
- **Deadline**: optional target date.
- **Success criteria**: measurable definition of done.

### Heartbeat Protocol

Agents are activated on a schedule (heartbeat), not continuously running:

```
  +----------+     +-----------+     +----------+     +----------+
  | Trigger  |---->| Wake      |---->| Execute  |---->| Report   |
  | (cron/   |     | Agent     |     | Tasks    |     | Results  |
  |  event)  |     |           |     |          |     | & Sleep  |
  +----------+     +-----------+     +----------+     +----------+
```

Heartbeat intervals are configurable per agent (e.g., every 15 minutes, hourly, daily).

### Approval Gates

Human-in-the-loop governance:

```
  Agent proposes action
        |
        v
  [requires approval?] --no--> execute
        |
       yes
        |
        v
  Queue for human review
        |
        v
  [approved?] --no--> reject + notify agent
        |
       yes
        |
        v
  Execute with audit trail
```

Approval rules are configurable per agent, per action type, and per cost threshold.

### Cost Tracking

Every agent action is metered:

- **Token usage**: LLM input/output tokens.
- **API calls**: external service invocations.
- **Dollar cost**: computed from token pricing and API fees.
- **Budget enforcement**: agents are paused when budget is exhausted.

```
  Budget {
      max_tokens_per_day:   number
      max_dollars_per_day:  number
      max_actions_per_hour: number
      alert_threshold:      number  -- percentage to trigger warning
  }
```

---

## Execution Layer

The Execution Layer is where AI agents interact with the real world. Inspired by OpenClaw's architecture.

### Agent Adapters

Adapters normalize different AI backends behind a common interface:

```
                      +-------------------+
                      | AgentAdapter      |
                      | (interface)       |
                      +---+------+--------+
                          |      |
              +-----------+      +------------+
              |                               |
  +-----------v-----------+   +---------------v---------+
  | ClaudeAdapter         |   | CodexAdapter            |
  | (Claude Code / API)   |   | (OpenAI Codex)          |
  +------------------------+  +-------------------------+
              |
  +-----------v-----------+
  | OpenClawAdapter       |
  | (OpenClaw agents)     |
  +-----------------------+
```

```typescript
interface AgentAdapter {
    id: string;
    execute(task: Task, context: AgentContext): Promise<TaskResult>;
    stream(task: Task, context: AgentContext): AsyncGenerator<TaskEvent>;
    estimateCost(task: Task): Promise<CostEstimate>;
    healthCheck(): Promise<boolean>;
}
```

### Channel Integrations

GTM execution across real channels:

| Channel    | Capabilities                        |
|------------|-------------------------------------|
| Email      | Outbound sequences, drip campaigns  |
| Social     | Content posting, engagement         |
| Messaging  | Slack, Discord community management |
| Content    | Blog posts, landing pages           |
| Ads        | Campaign management via APIs        |

### Campaign Execution

```
  Campaign Definition (from Graph)
        |
        v
  +------------------+
  | Scheduler        |  When to send, post, engage
  +--------+---------+
           |
           v
  +------------------+
  | Content Generator|  LLM creates channel-specific content
  +--------+---------+
           |
           v
  +------------------+
  | Channel Adapter  |  Sends through appropriate channel
  +--------+---------+
           |
           v
  +------------------+
  | Metrics Collector|  Tracks opens, clicks, replies, conversions
  +------------------+
```

### Proof Collection

Automated collection and organization of:
- Customer testimonials
- Case studies
- Usage statistics
- Social proof (mentions, reviews)

Proof feeds back into the Company Graph as `proof` nodes, strengthening marketing and sales.

---

## Real-Time System

### WebSocket Server

The server runs a WebSocket server alongside Express on the same port:

```
  Express HTTP Server
        |
        +-- /api/*          REST endpoints
        |
        +-- ws://           WebSocket upgrade
              |
              +-- simulation:progress    live sim updates
              +-- agent:activity         agent status stream
              +-- graph:update           graph change events
              +-- notification           user notifications
```

### Event Bus

Internal publish-subscribe system for cross-module communication:

```
  +----------+     +-----------+     +-----------+
  | Graph    |---->| Event Bus |---->| Simulation|
  | Engine   |     |           |     | Engine    |
  +----------+     |           |     +-----------+
                   |           |
  +----------+     |           |     +-----------+
  | Agent    |---->|           |---->| WebSocket |
  | Runtime  |     |           |     | Broadcast |
  +----------+     +-----------+     +-----------+
```

Events are typed and follow a standard envelope:

```typescript
interface SystemEvent {
    id: string;
    type: string;           // "graph.node.updated", "agent.task.completed"
    company_id: string;
    payload: unknown;
    timestamp: number;
    source: string;         // module that emitted the event
}
```

---

## Multi-Tenancy

### Company as Organizational Unit

Every record in the system is scoped to a `company_id`. There is no global data outside of user accounts.

```
  User --has-many--> CompanyMembership --belongs-to--> Company
                                                          |
                                     +--------------------+--------------------+
                                     |                    |                    |
                                  Graph              Agents              Simulations
                                  Nodes              Tasks               Campaigns
                                  Edges              Budgets             Metrics
```

### Key Properties

- **Isolation**: queries always filter by `company_id`. Row-level security in PostgreSQL.
- **Switching**: users can switch between companies in the UI.
- **Portability**: full company export (graph + config + history) as JSON. Import into any instance.
- **Secrets**: per-company API keys and configuration, encrypted at rest.

---

## API Design

### REST Endpoints

All endpoints are prefixed with `/api/v1` and scoped to a company via middleware.

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout

GET    /api/v1/companies
POST   /api/v1/companies
GET    /api/v1/companies/:id

-- All routes below require X-Company-Id header or company context --

GET    /api/v1/graph/nodes
POST   /api/v1/graph/nodes
PATCH  /api/v1/graph/nodes/:id
DELETE /api/v1/graph/nodes/:id
GET    /api/v1/graph/edges
POST   /api/v1/graph/edges

POST   /api/v1/simulations
GET    /api/v1/simulations/:id
POST   /api/v1/simulations/:id/apply
POST   /api/v1/simulations/:id/reject
POST   /api/v1/simulations/:id/branch

GET    /api/v1/agents
POST   /api/v1/agents
PATCH  /api/v1/agents/:id
GET    /api/v1/agents/:id/activity

GET    /api/v1/goals
POST   /api/v1/goals
PATCH  /api/v1/goals/:id

POST   /api/v1/genesis/start
GET    /api/v1/genesis/:id/status

GET    /api/v1/campaigns
POST   /api/v1/campaigns
GET    /api/v1/metrics
```

### WebSocket Events

Clients connect to `ws://host/ws` and receive events:

```
{ "type": "simulation:progress",  "data": { "simId": "...", "percent": 45 } }
{ "type": "agent:activity",       "data": { "agentId": "...", "action": "..." } }
{ "type": "graph:node:updated",   "data": { "nodeId": "...", "changes": {...} } }
{ "type": "graph:edge:created",   "data": { "edgeId": "...", "source": "...", "target": "..." } }
```

### Authentication

Better Auth handles:
- Email/password signup and login.
- Session management with JWT.
- Multi-user, multi-company membership.
- OAuth providers (GitHub, Google) for hosted version.

---

## Plugin System

### Architecture

Plugins extend AIDrivenCompany without modifying core code.

```
  +-------------------+
  | Plugin Manifest   |  name, version, capabilities, permissions
  +--------+----------+
           |
           v
  +-------------------+
  | Plugin Runtime    |  Worker-based isolation
  +--------+----------+
           |
           +----------+----------+
           |                     |
  +--------v--------+  +--------v--------+
  | Server Hooks    |  | UI Slots        |
  | (event handlers |  | (custom React   |
  |  API extensions)|  |  components)    |
  +-----------------+  +-----------------+
```

### Plugin Manifest

```typescript
interface PluginManifest {
    name: string;
    version: string;
    description: string;
    permissions: string[];      // "graph:read", "agent:execute", "ui:dashboard"
    hooks: string[];            // events the plugin subscribes to
    ui_slots: string[];         // where in the UI the plugin renders
    entry_server?: string;      // server-side entry point
    entry_ui?: string;          // client-side entry point
}
```

### Capability-Based Permissions

Plugins declare what they need. The system grants only those capabilities:

| Permission        | Grants                                 |
|-------------------|----------------------------------------|
| `graph:read`      | Read graph nodes and edges             |
| `graph:write`     | Create, update, delete graph data      |
| `agent:execute`   | Trigger agent task execution           |
| `simulation:run`  | Start simulations                      |
| `ui:dashboard`    | Render in dashboard slot               |
| `ui:sidebar`      | Render in sidebar slot                 |
| `secrets:read`    | Access company secrets (restricted)    |

### Communication

Plugins communicate with the core system through the event bus. They cannot access internals directly.

```
  Plugin --emit--> Event Bus --route--> Core System
  Core System --emit--> Event Bus --route--> Plugin (if subscribed)
```

---

## Data Model

High-level entity relationship overview:

```
  User
    |
    +-- CompanyMembership (role: owner | admin | member)
          |
          +-- Company
                |
                +-- GraphNode
                |     +-- GraphEdge (source, target)
                |
                +-- Simulation
                |     +-- SimulationBranch
                |
                +-- Agent
                |     +-- AgentBudget
                |     +-- AgentActivity
                |
                +-- Goal
                |     +-- Task
                |
                +-- Campaign
                |     +-- CampaignStep
                |
                +-- Metric
                |
                +-- Plugin (installed)
                |
                +-- Secret (encrypted)
```

---

## Deployment

### Local Development

```bash
# Clone and install
git clone https://github.com/AIDrivenCompany/aidrivencompany.git
cd aidrivencompany
pnpm install

# Start with SQLite (no external deps)
pnpm dev

# Or with PostgreSQL via Docker
docker-compose -f docker/docker-compose.dev.yml up -d
DATABASE_URL=postgres://... pnpm dev
```

### Production (Docker)

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

```
  +-------------------+     +-------------------+
  |  Nginx / Caddy    |     |  PostgreSQL       |
  |  (reverse proxy)  |     |  (persistent vol) |
  +--------+----------+     +--------+----------+
           |                          |
           v                          v
  +----------------------------------------+
  |  AIDrivenCompany Container             |
  |  (Express + React static + WebSocket)  |
  +----------------------------------------+
```

### Hosted (Fly.io / Railway)

Single container deployment with managed PostgreSQL. Environment variables for configuration:

```
DATABASE_URL          — PostgreSQL connection string
BETTER_AUTH_SECRET    — Auth signing secret
ENCRYPTION_KEY        — For company secrets at rest
LLM_API_KEY           — Default LLM provider key
PORT                  — Server port (default 3000)
```

---

## Design Principles

1. **Graph-first**: the Company Graph is the source of truth. Every feature reads from and writes to the graph.
2. **Simulate before acting**: changes flow through the Simulation Engine before they hit production.
3. **Human-in-the-loop**: AI proposes, humans approve. Governance is not optional.
4. **Budget-aware**: every AI action has a cost. Budgets are enforced, not advisory.
5. **Portable**: a company can be exported and imported. No vendor lock-in.
6. **Plugin-extensible**: core stays small. Capabilities grow through plugins.
7. **Real-time**: the system is live. Changes propagate immediately to all connected clients.
