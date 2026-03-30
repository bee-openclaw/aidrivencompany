# UX Philosophy

> **AIDrivenCompany** -- Company OS

---

## North Star

**"I am operating a real company -- not using a tool."**

Every design decision filters through this statement. If a screen feels like SaaS, it's wrong. If it feels like running a company, it's right.

---

## Core Principles

### 1. Not Tab-Based SaaS

Traditional SaaS ships disconnected tabs: Dashboard, Settings, Reports. AIDrivenCompany is a living, breathing company where everything is connected. Navigation mirrors moving through departments of a company, not clicking through tool features. There are no "modules" -- there are functions of a business.

### 2. Simulation-First Decision Making

Every significant change is simulatable. The UI makes it easy and natural to ask "what if?" before committing. Split views, before/after comparisons, and impact maps are first-class citizens. No blind commits. Founders see consequences before they act.

### 3. Progressive Disclosure

Four levels, strictly enforced:

| Level | View | Example |
|-------|------|---------|
| 1 | CEO Overview | Health, metrics, action items |
| 2 | System views | GTM, Product, Proof |
| 3 | Detail views | Individual campaigns, features, nodes |
| 4 | Raw data | Logs, API responses, agent transcripts |

Never show more than the user needs. Always let them drill deeper.

### 4. Graph-First Thinking

The Company Graph is always accessible. Users see how everything connects -- it is not a feature, it is the worldview. Impact paths surface during simulation. Relationships between nodes are visible at every level.

### 5. AI as Co-Founder, Not Tool

The AI is not a chatbot bolted onto a dashboard. It is a co-founder who understands the entire company. It proactively surfaces insights, suggests decisions, and flags risks. It speaks in context, not in prompts.

### 6. Mobile-Ready from Day One

Founders check their company on the go. Key views -- dashboard, notifications, approvals -- work perfectly on mobile. This is not responsive as an afterthought; mobile layouts are designed alongside desktop.

---

## Layout Structure

```
+-------+-------------+-------------------------+-----------+
| Left  |  Sidebar    |  Main Content Area      | Right     |
| Rail  |             |                         | Panel     |
|       |  Overview   |  (context-dependent)    | (slides   |
| Co.   |  Strategy   |                         |  out)     |
| Switc |  Product    |                         |           |
| her   |  Market     |                         | Detail /  |
|       |  Team       |                         | Inspector |
|       |  Insights   |                         |           |
|       |  Settings   |                         |           |
+-------+-------------+-------------------------+-----------+
                    [ Command Palette (Cmd+K) ]
```

### Left Rail
Company switcher for multi-company support. Compact, icon-driven. Shows active company with a clear visual indicator.

### Sidebar
Navigation organized by **company function**, not by feature:

- **Overview** -- CEO Dashboard
- **Strategy** -- Graph, Simulation, Decisions
- **Product** -- Features, Roadmap
- **Market** -- Campaigns, Channels, Proof
- **Team** -- Agents, Roles, Budgets
- **Insights** -- Metrics, Learning, Adaptation
- **Settings**

### Main Content Area
Context-dependent. Renders the active view for the selected function. Supports split panes for simulation comparisons.

### Right Panel
Slides out on demand. Used for detail inspection, node editing, and contextual information without leaving the current view.

### Command Palette
`Cmd+K` opens a quick-action palette. Search nodes, run simulations, navigate anywhere, trigger agent actions.

---

## Design System

- **Framework**: shadcn/ui + Tailwind CSS
- **Theme**: Dark mode first. Founders work late.
- **Color**: Minimal palette. Semantic colors map to node types in the Company Graph. Avoid decorative color.
- **Typography**: Clean, readable, information-dense. No wasted space, no wasted words.
- **Patterns**:
  - Cards for summary views
  - Tables for lists
  - Graphs for relationships
  - Consistent flow: `list -> detail -> edit -> simulate`

---

## Key Interactions

### Genesis Flow
Guided wizard -> AI conversation -> Company Graph generated -> Review -> Approve

The first experience. A founder describes their company, the AI builds the initial graph, and the founder refines it. No blank canvas -- the system generates a starting point.

### Simulation Flow
Select node -> "What if?" -> Define change -> See impact map -> Apply or Reject

The core loop. Every decision passes through simulation. The impact map shows downstream effects across the graph before anything is committed.

### Campaign Creation
Choose channel -> AI generates content -> Simulate reach -> Approve -> Execute

Market actions are generated, simulated, and executed in a single flow. The AI handles content; the founder handles judgment.

### Decision Making
Decision surfaces -> View options -> Simulate each -> Compare -> Decide -> Log rationale

Decisions are logged with rationale. The company learns from past decisions. Nothing is lost.

---

## What We Avoid

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| Dashboard fatigue | Too many metrics, no actionable insights |
| Chat-first UI | This is not a chatbot with a sidebar |
| Feature overload in navigation | Cognitive burden; breaks the company metaphor |
| Disconnected views | Every view must reference the graph |
| Generic SaaS patterns | Tabs and breadcrumbs as primary nav flatten the experience |

---

## Summary

AIDrivenCompany is a Company OS. The UX must reflect that. Every screen answers the question: "What is happening in my company right now, and what should I do next?" If a design does not serve that question, it does not ship.
