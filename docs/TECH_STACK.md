# Technology Stack

> Locked decisions for **AIDrivenCompany** -- an open-source + hosted Company OS.
>
> This document is the single source of truth. Any change requires a PR with rationale.

---

## Core

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Full-stack consistency, strong typing, ecosystem |
| Runtime | Node.js 22+ | LTS, native fetch, built-in test runner |
| Package Manager | pnpm 9+ | Fast, disk-efficient, great monorepo support |
| Monorepo | pnpm workspaces | No extra tooling (no Nx/Turborepo needed initially) |

## Backend

| Decision | Choice | Rationale |
|---|---|---|
| HTTP Framework | Express.js | Battle-tested, massive middleware ecosystem |
| WebSocket | ws | Lightweight, no Socket.io overhead |
| ORM | Drizzle ORM | Type-safe, lightweight, SQL-first |
| Database (Production) | PostgreSQL 16+ | Multi-tenant, JSONB for graph, robust |
| Database (Dev/Prototype) | SQLite via better-sqlite3 | Zero setup, fast iteration |
| Auth | Better Auth | Multi-user, multi-provider, self-hosted |
| Validation | Zod | Runtime + compile-time validation |
| API Style | REST + WebSocket | REST for CRUD, WS for real-time |

## Frontend

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 19 | Ecosystem, hiring, component libraries |
| Build Tool | Vite 6 | Fast HMR, excellent DX |
| Styling | Tailwind CSS 4 | Utility-first, consistent, fast |
| Component Library | shadcn/ui | Composable, accessible, owns the code |
| State Management | React Context + TanStack Query | Server state via Query, UI state via Context |
| Routing | React Router 7 | Standard, well-documented |
| Charts | Recharts | React-native charts, simple API |
| Graph Visualization | React Flow | Interactive node graphs, perfect for Company Graph |
| Markdown | MDXEditor or react-markdown | For content editing |
| Icons | Lucide React | Consistent, tree-shakeable |

## Testing

| Decision | Choice | Rationale |
|---|---|---|
| Unit Tests | Vitest | Fast, Vite-compatible, Jest-compatible API |
| E2E Tests | Playwright | Cross-browser, reliable, great DX |
| API Testing | Supertest | Standard for Express |
| AI Evaluation | promptfoo | Evaluate LLM outputs systematically |

## DevOps & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Containerization | Docker + docker-compose | Standard, reproducible |
| CI/CD | GitHub Actions | Free for open source, integrated |
| Hosted Platform | Fly.io or Railway | Easy Docker deploys, good free tiers |
| Self-hosted | Docker Compose | Single command setup |
| Reverse Proxy | Caddy (optional) | Auto-HTTPS, simple config |

## Code Quality

| Decision | Choice | Rationale |
|---|---|---|
| Linting | ESLint 9 (flat config) | Standard, extensive plugin ecosystem |
| Formatting | Prettier | Consistent formatting |
| Git Hooks | Husky + lint-staged | Pre-commit quality gates |
| Commit Convention | Conventional Commits | Automated changelogs |

## AI & LLM

| Decision | Choice | Rationale |
|---|---|---|
| Primary LLM | Claude (Anthropic) | Best for complex reasoning, coding |
| LLM Abstraction | Direct SDK (no LangChain) | Less complexity, more control |
| Agent Framework | Custom (inspired by OpenClaw/Paperclip) | Tailored to Company OS needs |
| Embeddings | OpenAI text-embedding-3-small | Cost-effective, good quality |
| Vector Store | PostgreSQL pgvector | Keep everything in one DB |

---

## Versions & Compatibility

| Dependency | Minimum Version |
|---|---|
| Node.js | >= 22.0.0 |
| pnpm | >= 9.15.0 |
| TypeScript | >= 5.7.0 |
| React | >= 19.0.0 |
| PostgreSQL | >= 16.0 |

---

## Decisions We Explicitly Avoided

### Next.js

We want a clear separation between the API server and the UI. Next.js merges server and client into one deployment unit, which limits flexibility for self-hosted users, makes WebSocket handling awkward, and couples the frontend framework to the backend runtime. A standalone Express server + a standalone Vite/React app gives us independent scaling, simpler Docker images, and the freedom to swap either side without touching the other.

### LangChain

LangChain adds a thick abstraction layer over LLM calls that hides what is actually happening. For a product where AI behavior must be transparent, debuggable, and tightly controlled, calling the Anthropic SDK directly is simpler and gives us full visibility into prompts, token usage, and error handling. We avoid the dependency churn and breaking changes that come with fast-moving abstraction frameworks.

### MongoDB

AIDrivenCompany is fundamentally relational -- organizations contain users, users have roles, roles map to permissions, entities link through a Company Graph. A relational database with foreign keys, joins, and transactions is the natural fit. PostgreSQL gives us relational integrity plus JSONB for the semi-structured data and pgvector for embeddings, eliminating the need for a separate document store.

### Socket.io

Socket.io bundles its own protocol, fallback transports, and a client library that must be kept in sync with the server version. The `ws` library implements the WebSocket standard directly, is significantly lighter, and avoids the abstraction overhead. Since we target modern browsers and do not need HTTP long-polling fallbacks, raw WebSockets give us everything we need with less code and fewer dependencies.

### Turborepo / Nx

pnpm workspaces already handle dependency hoisting, workspace linking, and parallel script execution. Adding Turborepo or Nx introduces configuration complexity, build-graph caching rules, and another tool to learn -- all before we have enough packages to benefit from remote caching or distributed task execution. We can adopt one later if the monorepo grows to the point where build times justify it.
