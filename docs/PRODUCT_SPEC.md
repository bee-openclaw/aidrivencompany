# AIDrivenCompany -- Product Specification

**Version**: 1.0
**Last Updated**: 2026-03-30
**Status**: Draft

AIDrivenCompany is a Company OS that takes a founder from raw idea to running company through a connected system of AI-powered modules. Every system feeds into a shared Company Graph, meaning changes in one area automatically surface consequences in all others.

---

## Table of Contents

1. [Genesis](#system-1-genesis)
2. [Simulation Engine](#system-2-simulation-engine)
3. [Company Core (CEO Layer)](#system-3-company-core)
4. [Company Graph Visualization](#system-4-company-graph-visualization)
5. [Product System](#system-5-product-system)
6. [GTM System](#system-6-gtm-system)
7. [Proof System](#system-7-proof-system)
8. [Learning System](#system-8-learning-system)
9. [Adaptation System](#system-9-adaptation-system)
10. [Agent Orchestration](#system-10-agent-orchestration)
11. [Multi-Company Workspace](#system-11-multi-company-workspace)
12. [Build Order (Phases)](#build-order)

---

## System 1: Genesis

**Objective**: Turn a raw idea (or no idea at all) into a fully defined company concept ready for simulation.

### Key Features

- Founder can start from a blank slate or receive AI-generated idea suggestions based on market signals, personal strengths, and trends.
- Genesis Agent performs structured research:
  - Market research (TAM/SAM/SOM, competitor landscape)
  - Ideal Customer Profile (ICP) identification
  - Wedge definition (initial beachhead market)
  - Problem validation (evidence the problem is real and painful)
  - Initial product shape (core value proposition and feature outline)
  - Initial GTM strategy (first channel, first message, first audience)
  - Risk analysis (key assumptions ranked by impact and uncertainty)
- Output: A complete Company Definition document, the initial Company Graph populated with all nodes, and a simulation-ready state.
- Guided wizard supports both free-form AI conversation and structured step-by-step progression.

### UI Description

Guided wizard flow with an AI conversation panel on the right and structured output cards on the left. Each step (market, ICP, wedge, product, GTM, risk) appears as a collapsible section that fills in as the conversation progresses. A progress indicator at the top shows completion across all steps. A "Finalize" button locks the definition and triggers initial graph generation.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/genesis/start` | Create a new genesis session |
| GET | `/api/genesis/:sessionId` | Retrieve session state |
| POST | `/api/genesis/:sessionId/chat` | Send a message to the Genesis Agent |
| POST | `/api/genesis/:sessionId/suggest-ideas` | Request AI-generated idea suggestions |
| PUT | `/api/genesis/:sessionId/step/:stepName` | Update a specific step (market, icp, wedge, product, gtm, risk) |
| POST | `/api/genesis/:sessionId/finalize` | Finalize the company definition and generate graph |
| GET | `/api/genesis/:sessionId/export` | Export the company definition as JSON |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `genesis_sessions` | id, company_id, status, current_step, created_at, finalized_at | Tracks wizard session state |
| `genesis_steps` | id, session_id, step_name, content (JSONB), status, updated_at | Stores output of each research step |
| `genesis_conversations` | id, session_id, role, message, metadata (JSONB), created_at | Chat history with the Genesis Agent |
| `genesis_idea_suggestions` | id, session_id, title, summary, signals (JSONB), selected | AI-generated idea candidates |

---

## System 2: Simulation Engine

**Objective**: Allow founders to explore the consequences of any change before committing to it.

### Key Features

- Simulate changes to any Company Graph node: ICP, pricing, features, GTM channels, messaging, positioning.
- System calculates and displays downstream impact across the entire Company Graph.
- Each simulation shows: affected nodes, tradeoff summary, risk delta, and AI recommendations.
- Branching support: explore multiple scenarios side by side, compare outcomes, then apply or reject.
- Simulation history is preserved for audit and learning.
- Simulations can be triggered manually or automatically by the Adaptation System.

### UI Description

Split-view layout. Left panel shows the proposed change (editable form). Right panel shows an impact map: a filtered view of the Company Graph highlighting only affected nodes. Each affected node shows before/after values and a severity indicator (green/yellow/red). A scenario bar at the top allows switching between branches. "Apply" and "Reject" buttons at the bottom commit or discard the change.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/simulations` | Create a new simulation |
| GET | `/api/simulations/:id` | Retrieve simulation results |
| GET | `/api/simulations` | List all simulations for a company |
| POST | `/api/simulations/:id/branch` | Create a branch from an existing simulation |
| GET | `/api/simulations/:id/compare/:branchId` | Compare two simulation branches |
| POST | `/api/simulations/:id/apply` | Apply simulation results to the live Company Graph |
| POST | `/api/simulations/:id/reject` | Reject and archive a simulation |
| GET | `/api/simulations/:id/impact` | Get the full impact analysis for a simulation |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `simulations` | id, company_id, status (draft/running/complete/applied/rejected), trigger_source, created_at | Root simulation record |
| `simulation_changes` | id, simulation_id, node_id, field, old_value, new_value | Proposed changes in this simulation |
| `simulation_impacts` | id, simulation_id, affected_node_id, impact_type, severity, description | Calculated downstream effects |
| `simulation_branches` | id, parent_simulation_id, name, created_at | Branching for scenario comparison |
| `simulation_recommendations` | id, simulation_id, recommendation, confidence, reasoning | AI-generated advice |

---

## System 3: Company Core (CEO Layer)

**Objective**: Establish the operating brain of the company -- a single place where the founder sees health, makes decisions, and tracks history.

### Key Features

- Founder dashboard showing company health at a glance: key metrics, active campaigns, pending decisions, recent events.
- Decision system: AI surfaces decisions that need attention (e.g., "Your ICP feedback suggests a pivot"), founder approves or rejects with rationale.
- Timeline: chronological log of all decisions, events, milestones, and system actions.
- Company overview panel: mission statement, ICP summary, product summary, GTM summary, all editable.
- Action items: auto-generated tasks from decisions and simulation results.

### UI Description

Dashboard layout with a card grid. Top row: health score card, active decisions count, campaign performance sparkline, next milestone. Middle row: pending decision cards (each with context, options, and approve/reject buttons). Bottom row: timeline (vertical, scrollable, filterable by category). A persistent sidebar shows the company overview with inline editing. Action items appear as a checklist overlay.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/:id/dashboard` | Aggregated dashboard data |
| GET | `/api/company/:id/health` | Health score and contributing metrics |
| GET | `/api/company/:id/decisions` | List pending and past decisions |
| POST | `/api/company/:id/decisions/:decisionId/resolve` | Approve or reject a decision with rationale |
| GET | `/api/company/:id/timeline` | Chronological event log (paginated, filterable) |
| GET | `/api/company/:id/overview` | Company overview (mission, ICP, product, GTM) |
| PUT | `/api/company/:id/overview` | Update company overview fields |
| GET | `/api/company/:id/actions` | List auto-generated action items |
| PUT | `/api/company/:id/actions/:actionId` | Mark action item complete or dismissed |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `companies` | id, name, mission, status, health_score, created_at, updated_at | Core company record |
| `decisions` | id, company_id, title, context, options (JSONB), resolution, rationale, resolved_at, surfaced_by | Decisions requiring founder input |
| `timeline_events` | id, company_id, event_type, title, description, metadata (JSONB), created_at | Chronological activity log |
| `action_items` | id, company_id, source_type, source_id, title, status, due_date | Tasks generated from decisions and simulations |
| `company_overviews` | id, company_id, section (mission/icp/product/gtm), content (JSONB), updated_at | Editable overview sections |

---

## System 4: Company Graph Visualization

**Objective**: Make the connected system visible and interactive so founders can see how every part of their company relates.

### Key Features

- Interactive node graph rendered with React Flow.
- Nodes are colored by type (ICP = blue, Product = purple, GTM = green, Proof = orange, etc.) and sized by importance score.
- Edges represent relationship types: "depends_on", "influences", "feeds_into", "validates".
- Click any node to open a sidebar detail panel for viewing and inline editing.
- During simulation, affected nodes pulse and impact paths are highlighted with colored edges.
- Zoom, pan, filter by node type, search by name.
- Layout modes: force-directed (default), hierarchical, radial.

### UI Description

Full-screen graph canvas with a collapsible sidebar on the right. The sidebar shows node details when a node is selected: title, type, properties, connected nodes, and an edit form. A toolbar at the top provides: search field, node type filter chips, layout selector dropdown, zoom controls, and a "Simulation Mode" toggle. In simulation mode, the graph dims unaffected nodes and animates impact paths.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/graph/:companyId` | Full graph (nodes + edges) for a company |
| GET | `/api/graph/:companyId/node/:nodeId` | Single node with its connections |
| PUT | `/api/graph/:companyId/node/:nodeId` | Update a node's properties |
| POST | `/api/graph/:companyId/node` | Create a new node |
| DELETE | `/api/graph/:companyId/node/:nodeId` | Remove a node |
| POST | `/api/graph/:companyId/edge` | Create an edge between two nodes |
| DELETE | `/api/graph/:companyId/edge/:edgeId` | Remove an edge |
| GET | `/api/graph/:companyId/impact-path?from=:nodeId` | Get all downstream impact paths from a node |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `graph_nodes` | id, company_id, type, label, properties (JSONB), importance_score, position_x, position_y | Every entity in the company graph |
| `graph_edges` | id, company_id, source_node_id, target_node_id, relationship_type, weight | Connections between nodes |
| `graph_layouts` | id, company_id, layout_type, node_positions (JSONB), is_default | Saved layout configurations |

---

## System 5: Product System

**Objective**: Define and manage the product from MVP through iteration.

### Key Features

- MVP definition: describe the core product, set scope boundaries, list what is in and out.
- Feature list with prioritization (impact vs. effort matrix).
- Each feature linked to ICP needs and GTM messaging through the Company Graph.
- Product preview: AI-generated wireframe descriptions and basic layout mockups.
- Version tracking: snapshots of the product definition over time.
- Connected to pricing (features gate tiers), proof (features drive case studies), and GTM (features drive messaging).

### UI Description

Feature board in either kanban view (columns: Backlog, Planned, In Progress, Shipped) or list view (sortable table). Each feature card shows: name, priority score, linked ICP need, status, and effort estimate. A detail panel opens on click with full description, wireframe preview, and graph connections. An MVP scope toggle at the top highlights which features are in the MVP cut.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/product/:companyId` | Product definition and metadata |
| PUT | `/api/product/:companyId` | Update product definition |
| GET | `/api/product/:companyId/features` | List all features (filterable, sortable) |
| POST | `/api/product/:companyId/features` | Create a new feature |
| PUT | `/api/product/:companyId/features/:featureId` | Update a feature |
| DELETE | `/api/product/:companyId/features/:featureId` | Remove a feature |
| POST | `/api/product/:companyId/features/:featureId/prioritize` | Recalculate priority score |
| GET | `/api/product/:companyId/features/:featureId/preview` | Generate AI wireframe/preview |
| GET | `/api/product/:companyId/versions` | List product version snapshots |
| POST | `/api/product/:companyId/versions` | Create a new version snapshot |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `products` | id, company_id, name, description, scope_definition (JSONB), current_version | Core product record |
| `features` | id, product_id, name, description, status, priority_score, effort_estimate, is_mvp, created_at | Individual features |
| `feature_links` | id, feature_id, linked_node_id, link_type (icp_need/gtm_message/pricing_tier) | Connections to other graph nodes |
| `product_versions` | id, product_id, version_number, snapshot (JSONB), created_at | Point-in-time product snapshots |
| `feature_previews` | id, feature_id, preview_type, content (JSONB), generated_at | AI-generated wireframes and mockups |

---

## System 6: GTM System (Go-To-Market)

**Objective**: Launch the company into the market through structured, multi-channel campaigns.

### Key Features

- First-class channel support: Email, Paid Marketing, YouTube, Instagram, WhatsApp, Field Outreach.
- Per-channel campaign creation with structured setup flow.
- AI content generation per channel (email copy, ad creative briefs, video scripts, social captions, outreach scripts).
- Pre-launch simulation: predict campaign outcomes before spending budget.
- Execution plan: step-by-step launch checklist per campaign.
- Performance tracking: impressions, clicks, conversions, cost, and ROI per campaign.
- Campaign-to-proof pipeline: successful campaigns feed the Proof System.

### UI Description

Campaign manager with a horizontal channel tab bar at the top (Email, Paid, YouTube, Instagram, WhatsApp, Field). Each tab shows a list of campaigns for that channel in card format. Clicking a campaign opens a multi-step detail view: Setup (audience, budget, timing), Content (AI-generated drafts with editing), Simulation (predicted outcomes), Execute (launch checklist), and Track (live metrics). A summary dashboard at the top of each channel shows aggregate performance.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gtm/:companyId/campaigns` | List all campaigns (filterable by channel, status) |
| POST | `/api/gtm/:companyId/campaigns` | Create a new campaign |
| GET | `/api/gtm/:companyId/campaigns/:id` | Get campaign details |
| PUT | `/api/gtm/:companyId/campaigns/:id` | Update campaign configuration |
| DELETE | `/api/gtm/:companyId/campaigns/:id` | Delete a campaign |
| POST | `/api/gtm/:companyId/campaigns/:id/generate-content` | AI-generate content for a campaign |
| POST | `/api/gtm/:companyId/campaigns/:id/simulate` | Simulate campaign outcomes |
| POST | `/api/gtm/:companyId/campaigns/:id/launch` | Mark campaign as launched |
| GET | `/api/gtm/:companyId/campaigns/:id/metrics` | Get campaign performance metrics |
| GET | `/api/gtm/:companyId/channels/:channel/summary` | Aggregate metrics for a channel |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `campaigns` | id, company_id, channel, name, status (draft/simulated/live/paused/complete), audience (JSONB), budget, start_date, end_date | Campaign records |
| `campaign_content` | id, campaign_id, content_type, body, metadata (JSONB), version, is_active | Generated and edited content per campaign |
| `campaign_simulations` | id, campaign_id, predicted_impressions, predicted_clicks, predicted_conversions, predicted_cost, confidence | Pre-launch outcome predictions |
| `campaign_metrics` | id, campaign_id, date, impressions, clicks, conversions, cost, custom_metrics (JSONB) | Daily performance data |
| `campaign_checklists` | id, campaign_id, step_name, status, completed_at | Execution plan steps |

---

## System 7: Proof System

**Objective**: Generate trust and validation assets that strengthen GTM and sales.

### Key Features

- Testimonial capture: collect and store customer quotes with attribution.
- Case study generation: AI drafts case studies from campaign results, testimonials, and product usage data.
- Narrative building: construct an evolving company narrative ("why we exist", "what we have proven").
- Proof asset library: searchable, taggable collection of all trust assets.
- Proof assets can be attached to GTM campaigns, product pages, and outreach sequences.
- Templates for common proof formats (quote card, case study, social proof banner).

### UI Description

Proof library view with a grid of proof asset cards. Each card shows: type icon (testimonial, case study, narrative), title, preview snippet, tags, and usage count. A filter bar at the top allows filtering by type, tag, and campaign source. Clicking a card opens a detail view with the full content, editing tools, and a list of places where the asset is used. A "Create" button opens a template picker. An AI assist button on case studies triggers auto-generation from linked data.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/proof/:companyId` | List all proof assets (filterable by type, tag) |
| POST | `/api/proof/:companyId` | Create a new proof asset |
| GET | `/api/proof/:companyId/:assetId` | Get proof asset details |
| PUT | `/api/proof/:companyId/:assetId` | Update a proof asset |
| DELETE | `/api/proof/:companyId/:assetId` | Delete a proof asset |
| POST | `/api/proof/:companyId/generate-case-study` | AI-generate a case study from linked data |
| POST | `/api/proof/:companyId/:assetId/tag` | Add tags to a proof asset |
| GET | `/api/proof/:companyId/:assetId/usage` | List where a proof asset is used |
| GET | `/api/proof/:companyId/templates` | List available proof templates |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `proof_assets` | id, company_id, type (testimonial/case_study/narrative), title, content (JSONB), source_campaign_id, created_at | Trust and validation assets |
| `proof_tags` | id, asset_id, tag | Tags for filtering and organization |
| `proof_usage` | id, asset_id, used_in_type (campaign/product/outreach), used_in_id | Where each asset is deployed |
| `proof_templates` | id, name, type, structure (JSONB), is_default | Reusable proof format templates |

---

## System 8: Learning System

**Objective**: Understand what is working and what is not by tracking signals across all systems.

### Key Features

- Signal tracking: automatically capture events from all systems (campaign launched, feature shipped, decision made, simulation applied).
- Outcome measurement: compare actual results against goals set at creation time.
- Gap identification: surface areas where performance falls below expectations.
- Opportunity detection: identify patterns that suggest untapped potential (e.g., a channel performing above expectations).
- Insight generation: AI synthesizes signals into actionable insights.
- Insights are surfaced to the CEO Dashboard and can trigger the Adaptation System.

### UI Description

Analytics dashboard with three sections. Top: KPI cards showing key metrics with trend arrows and goal comparison. Middle: time-series charts for signal categories (GTM performance, product progress, proof coverage) with date range selector. Bottom: insight feed -- AI-generated insight cards sorted by recency and impact. Each insight card shows: title, supporting data points, suggested action, and a "Send to Adaptation" button. A filter sidebar allows drilling into specific systems or time ranges.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning/:companyId/signals` | List tracked signals (filterable by source system, date range) |
| GET | `/api/learning/:companyId/metrics` | Aggregated metrics with trend data |
| GET | `/api/learning/:companyId/goals` | List goals and actual vs. expected |
| POST | `/api/learning/:companyId/goals` | Set a new goal |
| PUT | `/api/learning/:companyId/goals/:goalId` | Update a goal |
| GET | `/api/learning/:companyId/gaps` | List identified performance gaps |
| GET | `/api/learning/:companyId/opportunities` | List identified opportunities |
| GET | `/api/learning/:companyId/insights` | AI-generated insights (paginated) |
| POST | `/api/learning/:companyId/insights/:insightId/send-to-adaptation` | Push an insight to the Adaptation System |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `signals` | id, company_id, source_system, event_type, payload (JSONB), created_at | Raw event stream from all systems |
| `goals` | id, company_id, metric_name, target_value, current_value, period, status | Measurable objectives |
| `insights` | id, company_id, title, body, supporting_signals (JSONB), suggested_action, impact_score, status (new/viewed/acted_on), created_at | AI-generated learnings |
| `metric_snapshots` | id, company_id, metric_name, value, snapshot_date | Daily metric snapshots for trend analysis |

---

## System 9: Adaptation System

**Objective**: Continuously improve the company by proposing and applying changes based on learning.

### Key Features

- Propose modifications to: product features, pricing, GTM strategy, messaging, ICP definition.
- Each proposed adaptation includes: rationale (linked to insights), predicted impact, and risk level.
- Accepting an adaptation automatically triggers a simulation before applying.
- Downstream systems update automatically when an adaptation is applied.
- Adaptation history tracks what was changed, why, and what happened afterward.
- Can operate in manual mode (founder approves each adaptation) or assisted mode (low-risk adaptations auto-apply after simulation passes).

### UI Description

Suggestions panel as a sidebar or dedicated page. Each suggestion card shows: what to change, why (linked insight), predicted impact (from simulation preview), and risk level badge. Two action buttons: "Simulate" (runs full simulation) and "Apply" (applies after simulation confirmation). A toggle at the top switches between manual and assisted mode. An adaptation history tab shows a timeline of past adaptations with before/after comparisons and outcome tracking.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/adaptation/:companyId/suggestions` | List pending adaptation suggestions |
| POST | `/api/adaptation/:companyId/suggestions` | Create a manual adaptation suggestion |
| GET | `/api/adaptation/:companyId/suggestions/:id` | Get suggestion details |
| POST | `/api/adaptation/:companyId/suggestions/:id/simulate` | Run simulation for a suggestion |
| POST | `/api/adaptation/:companyId/suggestions/:id/apply` | Apply a suggestion (triggers simulation first) |
| POST | `/api/adaptation/:companyId/suggestions/:id/dismiss` | Dismiss a suggestion |
| GET | `/api/adaptation/:companyId/history` | List applied adaptations with outcomes |
| GET | `/api/adaptation/:companyId/settings` | Get adaptation mode (manual/assisted) |
| PUT | `/api/adaptation/:companyId/settings` | Update adaptation mode |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `adaptations` | id, company_id, target_system, target_field, current_value, proposed_value, rationale, linked_insight_id, risk_level, status (pending/simulated/applied/dismissed), created_at | Proposed changes |
| `adaptation_outcomes` | id, adaptation_id, metric_name, before_value, after_value, measured_at | Post-application outcome tracking |
| `adaptation_settings` | id, company_id, mode (manual/assisted), auto_apply_risk_threshold | Per-company adaptation preferences |

---

## System 10: Agent Orchestration

**Objective**: Manage the AI agents that execute work across all systems.

### Key Features

- Agent registry: each agent has a name, role, adapter (which AI model/tool it connects to), and capabilities list.
- Goal alignment: every agent task must trace back to a company goal or active decision. No orphan work.
- Heartbeat protocol: agents can be scheduled for periodic activation (e.g., "check competitor pricing daily").
- Cost tracking: every agent invocation is logged with token usage and estimated cost.
- Budget management: per-agent and company-wide budget limits with alerts.
- Approval gates: certain actions require founder approval before execution (configurable by risk level).
- Agent communication: agents can pass context to other agents through structured handoff.

### UI Description

Two views. First: an org chart showing all agents, their roles, and reporting lines. Agents are shown as cards arranged in a hierarchy. Each card shows: name, role, status (active/idle/paused), last heartbeat, cost this period. Clicking an agent opens a management panel with: configuration, task history, cost breakdown, heartbeat schedule, and approval gate settings. Second: a budget dashboard showing cost trends, per-agent spend, and budget remaining with projections.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/:companyId` | List all agents |
| POST | `/api/agents/:companyId` | Register a new agent |
| GET | `/api/agents/:companyId/:agentId` | Get agent details and status |
| PUT | `/api/agents/:companyId/:agentId` | Update agent configuration |
| DELETE | `/api/agents/:companyId/:agentId` | Deregister an agent |
| POST | `/api/agents/:companyId/:agentId/invoke` | Trigger an agent invocation |
| GET | `/api/agents/:companyId/:agentId/tasks` | List agent task history |
| GET | `/api/agents/:companyId/:agentId/costs` | Get agent cost breakdown |
| POST | `/api/agents/:companyId/:agentId/heartbeat` | Configure heartbeat schedule |
| GET | `/api/agents/:companyId/budget` | Company-wide budget status |
| PUT | `/api/agents/:companyId/budget` | Set or update budget limits |
| GET | `/api/agents/:companyId/approvals` | List pending approval gates |
| POST | `/api/agents/:companyId/approvals/:approvalId/resolve` | Approve or reject an agent action |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `agents` | id, company_id, name, role, adapter, capabilities (JSONB), status, budget_limit, created_at | Agent registry |
| `agent_tasks` | id, agent_id, goal_id, input (JSONB), output (JSONB), status, tokens_used, cost, started_at, completed_at | Task execution log |
| `agent_heartbeats` | id, agent_id, cron_expression, last_run, next_run, is_active | Scheduled activation config |
| `agent_budgets` | id, company_id, agent_id (nullable for company-wide), period, limit, spent, alert_threshold | Budget tracking |
| `agent_approvals` | id, agent_id, task_id, action_description, risk_level, status (pending/approved/rejected), resolved_by, resolved_at | Governance gates |
| `agent_handoffs` | id, from_agent_id, to_agent_id, context (JSONB), created_at | Inter-agent communication log |

---

## System 11: Multi-Company Workspace

**Objective**: Allow founders to operate multiple companies from a single account.

### Key Features

- Create new companies (each goes through Genesis).
- Switch between companies instantly.
- Compare companies side by side (health scores, key metrics, progress).
- Archive companies (frozen state, read-only, restorable).
- Fork a company (duplicate as a starting point for a new venture).
- Full export/import (JSON format for backup and portability).
- Each company is fully isolated: separate graph, agents, campaigns, data.

### UI Description

A vertical company rail in the left sidebar showing company icons/initials. Clicking a company switches the entire workspace context. A "+" button at the bottom of the rail creates a new company (launches Genesis). Right-clicking a company shows a context menu: Rename, Archive, Fork, Export, Delete. A "Compare" mode opens a side-by-side dashboard for two selected companies. The top of the rail shows the current workspace name and a settings gear for workspace-level preferences.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspace/companies` | List all companies in the workspace |
| POST | `/api/workspace/companies` | Create a new company (triggers Genesis) |
| GET | `/api/workspace/companies/:id` | Get company summary |
| PUT | `/api/workspace/companies/:id` | Update company metadata (name, icon) |
| DELETE | `/api/workspace/companies/:id` | Delete a company (soft delete) |
| POST | `/api/workspace/companies/:id/archive` | Archive a company |
| POST | `/api/workspace/companies/:id/restore` | Restore an archived company |
| POST | `/api/workspace/companies/:id/fork` | Fork a company into a new copy |
| GET | `/api/workspace/companies/:id/export` | Export full company data as JSON |
| POST | `/api/workspace/companies/import` | Import a company from JSON |
| GET | `/api/workspace/compare?ids=:id1,:id2` | Compare two companies side by side |
| PUT | `/api/workspace/settings` | Update workspace-level preferences |

### Database Tables

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `workspaces` | id, owner_user_id, name, settings (JSONB), created_at | User workspace |
| `workspace_companies` | id, workspace_id, company_id, display_order, is_archived, archived_at | Company membership in a workspace |
| `company_exports` | id, company_id, export_data (JSONB), format_version, created_at | Export snapshots for backup/portability |

---

## Build Order

### Phase 1 -- MVP

**Systems**: Genesis + Company Graph + Company Core (CEO Dashboard) + Simulation (basic)

**Goal**: A founder can go from zero to a defined company, see it as a connected graph, manage it from a dashboard, and simulate basic changes.

**Scope**:
- Genesis: full wizard flow, all research steps, finalization
- Company Graph: node/edge CRUD, basic visualization, click-to-view
- Company Core: dashboard with health score, decisions, timeline
- Simulation: single-variable simulation, impact display (no branching yet)

### Phase 2

**Systems**: GTM System + Campaign Manager + Proof System

**Goal**: The company can launch campaigns, track performance, and build trust assets.

**Scope**:
- GTM: all six channels, campaign CRUD, content generation, basic metrics
- Proof: testimonial capture, case study generation, asset library
- Simulation: add branching support

### Phase 3

**Systems**: Agent Orchestration + Heartbeat + Budgets

**Goal**: AI agents can be registered, scheduled, and governed with cost controls.

**Scope**:
- Agent registry with adapters
- Heartbeat scheduling
- Budget limits and cost tracking
- Approval gates

### Phase 4

**Systems**: Learning + Adaptation + Multi-Company

**Goal**: The system learns from its own data, proposes improvements, and founders can run multiple companies.

**Scope**:
- Learning: signal tracking, goal measurement, insight generation
- Adaptation: suggestion pipeline, auto-simulation, manual and assisted modes
- Multi-Company: workspace, switching, compare, archive, fork, export/import

### Phase 5

**Systems**: Plugin System + Marketplace

**Goal**: Third parties can extend AIDrivenCompany with custom agents, integrations, and templates.

**Scope**: To be specified after Phase 4 learning.
