# CLAUDE.md — AIDrivenCompany

## What This Project Is

AIDrivenCompany is a **Company OS** — a platform where founders create, simulate, and operate companies end-to-end using AI. It is open source (MIT) and has a hosted version.

**It is NOT**: a product builder, a dashboard tool, a chatbot, or disconnected SaaS features.

## Three Layers

1. **Strategy** — Genesis (idea→company), Simulation (what-if), Company Graph, CEO Dashboard
2. **Orchestration** — Agent management, roles, budgets, goals, governance, heartbeats
3. **Execution** — AI agents executing across channels (email, social, messaging)

**Core Loop**: Simulate → Build → Launch → Learn → Adapt → Repeat

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Language**: TypeScript (strict mode, no `any`)
- **Server**: Express.js + WebSocket (ws)
- **Database**: PostgreSQL (Drizzle ORM) / SQLite for dev
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Testing**: Vitest (unit), Playwright (E2E)
- **Auth**: Better Auth

## Package Boundaries (CRITICAL)

```
server/          → Express API, business logic, graph/simulation engines
ui/              → React frontend (pages, components, hooks, context)
packages/db/     → Drizzle schema, migrations, queries
packages/shared/ → Types and utilities shared between server and UI
packages/adapters/ → Agent adapter implementations
packages/plugins/  → Plugin SDK and runtime
```

**Rules**:
- NEVER import server code from UI or vice versa
- NEVER import across adapter packages
- Shared types go in `packages/shared`
- Database queries go in `packages/db`

## Code Conventions

- Express: route → service → db query pattern
- React: functional components + hooks, no class components
- All external input validated with Zod
- All API calls from UI through typed clients in `ui/src/api/`
- Use existing shadcn/ui components before creating new ones
- Every database query MUST be scoped to `company_id`

## What NOT to Do

- Don't add dependencies without clear justification
- Don't create abstractions for one-time operations
- Don't add error handling for impossible scenarios
- Don't mock the database in integration tests
- Don't use relative imports escaping package boundaries
- Don't add comments that restate the code
- Don't create new files when editing existing ones works
- Don't add features beyond what was asked

## Testing

- Unit tests: `*.test.ts` next to source files
- E2E tests: `tests/` directory
- Run: `pnpm test` (unit), `pnpm test:e2e` (E2E)

## Git

- Conventional Commits: `feat(server):`, `fix(ui):`, `docs:`, etc.
- One logical change per commit
- Never force push to main

## Key Documentation

- `docs/VISION.md` — What we're building and why
- `docs/ARCHITECTURE.md` — Technical blueprint
- `docs/DATA_MODEL.md` — Company Graph and database schema
- `docs/PRODUCT_SPEC.md` — Feature specifications
- `docs/TECH_STACK.md` — Technology decisions
- `docs/UX_PHILOSOPHY.md` — Design principles
- `docs/CONTRIBUTING.md` — How to contribute
- `docs/AGENTS.md` — AI agent coding conventions
- `docs/DEPLOYMENT.md` — Deployment guide
- `docs/SECURITY.md` — Security practices
