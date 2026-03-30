# AGENTS.md — AI Coding Conventions for AIDrivenCompany

## Project Overview

AIDrivenCompany is a Company OS built as a TypeScript monorepo managed with pnpm.

Three architectural layers:

- **Strategy** — Genesis (company creation), Simulation (scenario modeling), Graph (entity relationships)
- **Orchestration** — Agents, goals, budgets
- **Execution** — Channels, campaigns

## Package Boundaries

```
server/            Express API, business logic, graph engine, simulation engine
ui/                React frontend, pages, components (shadcn/ui + Tailwind)
packages/db/       Drizzle schema, migrations, queries
packages/shared/   Types and utilities shared between server and UI
packages/adapters/ Agent adapter implementations
packages/plugins/  Plugin SDK and runtime
```

**Rules:**

- NEVER import server code from UI or vice versa.
- NEVER import from one adapter into another.
- Shared types MUST go in `packages/shared`.
- Do NOT use relative imports that escape a package boundary.

## Code Conventions

- TypeScript strict mode. No `any`.
- Zod for all external input validation.
- Drizzle for all database operations.
- Server pattern: Express route -> service -> db query.
- React: functional components and hooks only. No class components.
- Use existing shadcn/ui components before creating new ones.
- All API calls go through typed client functions in `ui/src/api/`.

## What NOT to Do

- Do not add dependencies without justification.
- Do not create abstraction layers for one-time operations.
- Do not add error handling for scenarios that cannot happen.
- Do not mock the database in integration tests.
- Do not add comments that restate the code.
- Do not create new files when editing existing ones would work.

## Testing

- Unit tests live next to source files: `*.test.ts`.
- E2E tests live in the `tests/` directory.
- Always test the happy path plus at least one error case.
- Use a real database for integration tests. Do not mock it.

## Git

- Conventional commits (`feat:`, `fix:`, `chore:`, etc.).
- One logical change per commit.
- Never force push to main.
