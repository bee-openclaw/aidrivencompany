# AIDrivenCompany

**The Company OS — Create, simulate, and operate companies end-to-end using AI.**

> "How will companies be created in the future?"
> Through AI-native systems where ideas are simulated, executed, and evolved continuously within a unified Company OS.

---

## What Is This?

AIDrivenCompany is an open source platform that lets founders go from zero (no idea) to a fully operating company — powered by AI at every layer.

Unlike tools that help with *parts* of building a company (a landing page builder, a CRM, a project manager), this is the **entire operating system** for a company.

### The Three Layers

```
┌─────────────────────────────────────────────┐
│          Strategy Layer (The Brain)         │
│   Genesis · Simulation · Company Graph      │
│   "What company to build and how to win"    │
├─────────────────────────────────────────────┤
│       Orchestration Layer (Management)      │
│   Agents · Roles · Budgets · Governance     │
│   "Who does what and when"                  │
├─────────────────────────────────────────────┤
│        Execution Layer (The Workers)        │
│   Channels · Campaigns · Content · Proof    │
│   "Do the actual work"                      │
└─────────────────────────────────────────────┘
```

### Core Loop

**Simulate → Build → Launch → Learn → Adapt → Repeat**

---

## Key Features

- **Genesis** — Start from nothing. AI generates ideas, validates markets, defines your ICP, and builds your initial company blueprint
- **Company Graph** — Everything is connected. Change your pricing? See the impact on campaigns, ICP fit, and revenue projections instantly
- **Simulation Engine** — Ask "what if?" before committing. Simulate any change and see downstream impact across your entire company
- **CEO Dashboard** — One view of company health. Metrics, decisions, action items
- **GTM System** — Launch campaigns across email, YouTube, Instagram, WhatsApp, and more
- **Proof System** — Collect testimonials, generate case studies, build trust
- **Agent Orchestration** — Manage AI agents with roles, budgets, and approval gates
- **Multi-Company** — Run multiple companies from one workspace
- **Open Source** — MIT licensed. Self-host or use our hosted version

---

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+

### Development

```bash
git clone https://github.com/AIDrivenCompany/aidrivencompany.git
cd aidrivencompany
pnpm install
pnpm dev
```

Server starts on `http://localhost:3100`, UI on `http://localhost:5173`.

### Docker

```bash
docker compose up
```

Visit `http://localhost:3100`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Server | Express.js + WebSocket |
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Database | PostgreSQL (Drizzle ORM) |
| Testing | Vitest + Playwright |
| Deploy | Docker, Fly.io, Railway |

---

## Project Structure

```
aidrivencompany/
  server/              — API server (Express)
    src/
      routes/          — REST endpoints
      services/        — Business logic
      graph/           — Company Graph engine
      simulation/      — Simulation engine
      genesis/         — Genesis agent
  ui/                  — Frontend (React)
    src/
      pages/           — Page components
      components/      — UI components
      api/             — Typed API clients
  packages/
    db/                — Database schema & migrations
    shared/            — Shared types & utilities
    adapters/          — Agent adapters
    plugins/           — Plugin system
  docs/                — Documentation
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [VISION](docs/VISION.md) | What we're building and why |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Technical blueprint |
| [DATA MODEL](docs/DATA_MODEL.md) | Company Graph and database schema |
| [PRODUCT SPEC](docs/PRODUCT_SPEC.md) | Feature specifications |
| [TECH STACK](docs/TECH_STACK.md) | Technology decisions |
| [UX PHILOSOPHY](docs/UX_PHILOSOPHY.md) | Design principles |
| [CONTRIBUTING](docs/CONTRIBUTING.md) | How to contribute |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | Deployment guide |
| [SECURITY](docs/SECURITY.md) | Security practices |

---

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup instructions, code style, and PR process.

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Status

**Early Development** — We're building the foundation. Contributions welcome.
