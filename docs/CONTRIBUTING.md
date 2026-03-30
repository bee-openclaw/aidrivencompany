# Contributing to AIDrivenCompany

Thanks for your interest in contributing to AIDrivenCompany, an open source Company OS. This guide will get you productive in under 30 minutes.

## 1. Getting Started

### Prerequisites

- **Node.js 22+** (`node -v`)
- **pnpm 9+** (`pnpm -v`)
- **PostgreSQL 16+** (production) or **SQLite** (local dev)
- **Git**

### Setup

```bash
git clone https://github.com/aidrivencompany/aidrivencompany.git
cd aidrivencompany
pnpm install
cp .env.example .env        # configure your local env
pnpm db:migrate              # run database migrations
pnpm dev                     # starts all dev servers
```

The server runs on `http://localhost:3000` and the UI on `http://localhost:5173` by default.

## 2. Project Structure

```
aidrivencompany/
├── server/              # Express API server
├── ui/                  # React + Vite + Tailwind frontend
├── packages/
│   ├── db/              # Drizzle schema, migrations, seed
│   ├── shared/          # Shared types, constants, utilities
│   ├── adapters/        # External service integrations
│   └── plugins/         # Plugin system and built-in plugins
├── cli/                 # CLI tool
├── docs/                # Documentation
├── playwright/          # E2E test config and fixtures
└── pnpm-workspace.yaml
```

## 3. Development Workflow

### Branch Naming

Use prefixes that match commit types:

- `feat/short-description` -- new features
- `fix/short-description` -- bug fixes
- `docs/short-description` -- documentation only

Branch from `main`. Keep branches short-lived.

### Running Dev Servers

```bash
pnpm dev              # all packages in parallel
pnpm dev:server       # server only
pnpm dev:ui           # UI only
```

Hot reload is enabled for both server (via tsx) and UI (via Vite HMR). Changes to `packages/shared` are picked up automatically.

## 4. Code Style

- **TypeScript strict mode** is enabled in every package. Do not loosen it.
- **ESLint 9** with flat config (`eslint.config.ts`). Run `pnpm lint` to check.
- **Prettier** handles formatting. Run `pnpm format` or let your editor handle it.
- **No `any` types.** Use `unknown` and narrow, or define a proper type.
- **Zod** for all runtime validation (API inputs, config, env vars). Do not use manual type guards for external data.

```bash
pnpm lint             # check all packages
pnpm lint:fix         # auto-fix what's possible
pnpm format           # run Prettier
pnpm typecheck        # tsc --noEmit across all packages
```

## 5. Testing

| Layer | Tool | File naming | Command |
|-------|------|-------------|---------|
| Unit / Integration | Vitest | `*.test.ts` | `pnpm test` |
| End-to-end | Playwright | `*.e2e.ts` | `pnpm test:e2e` |

```bash
pnpm test                    # run all unit tests
pnpm test -- --watch         # watch mode
pnpm test:e2e                # run Playwright tests
pnpm test:e2e --ui           # Playwright UI mode
```

- Place test files next to the source they test.
- E2E tests live in `playwright/` or alongside UI components as `*.e2e.ts`.
- Every new feature needs unit tests. Every new user-facing flow needs an E2E test.

## 6. Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/). The scope is the package name.

```
<type>(<scope>): <short summary>

feat(server): add webhook retry with exponential backoff
fix(ui): prevent double-submit on invoice form
docs(shared): document ValidationError shape
refactor(db): extract tenant filtering to middleware
test(adapters): add Stripe webhook signature tests
chore(cli): bump commander to v13
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**Scope:** the package or directory name (`server`, `ui`, `db`, `shared`, `adapters`, `plugins`, `cli`, `docs`). Omit scope only for repo-wide changes.

## 7. Pull Request Process

1. Create a branch following the naming convention.
2. Make your changes with tests and documentation.
3. Open a PR against `main`. Fill in the PR template.
4. CI must pass (lint, typecheck, tests, build).
5. One approval from a maintainer is required.

### PR Checklist

- [ ] Tests added or updated
- [ ] Types are strict (no `any`)
- [ ] Lint and typecheck pass
- [ ] Documentation updated if behavior changed
- [ ] Migration included if schema changed
- [ ] PR title follows commit convention format

Keep PRs focused. One concern per PR. If your PR touches more than 400 lines, consider splitting it.

## 8. Package Boundaries

Each package has a clear responsibility. Respect the boundaries:

| Package | Contains | Does NOT contain |
|---------|----------|-----------------|
| `packages/shared` | Types, constants, pure utility functions | Side effects, DB access, UI components |
| `packages/db` | Drizzle schema, migrations, query helpers | Business logic, HTTP handling |
| `packages/adapters` | External service clients (Stripe, email, etc.) | Business logic, direct DB queries |
| `packages/plugins` | Plugin interfaces and built-in plugins | Core app logic |
| `server` | API routes, middleware, business logic | UI code, direct adapter construction |
| `ui` | React components, pages, client state | Server logic, direct DB access |
| `cli` | CLI commands and output formatting | Business logic (import from server) |

**Rules:**

- Import from a package's public API (`packages/shared/index.ts`), never from internal files.
- Shared types go in `packages/shared`. If two packages need the same type, move it there.
- Adapters are injected, not imported directly by business logic. Use the interfaces in `packages/shared`.

## 9. Database Changes

We use **Drizzle ORM** for schema and migrations.

```bash
pnpm db:generate           # generate a migration from schema changes
pnpm db:migrate            # apply pending migrations
pnpm db:seed               # load seed data for development
pnpm db:studio             # open Drizzle Studio
```

**Rules:**

- **Never edit an existing migration file.** Create a new migration instead.
- Schema lives in `packages/db/schema/`. One file per table or domain.
- Add seed data in `packages/db/seed/` for any new tables.
- Test migrations both up and down before submitting.
- Include the migration in your PR. Do not expect reviewers to generate it.

## 10. Documentation

- When you change a feature, update the relevant docs in `docs/`.
- API changes need updated endpoint documentation.
- New config options need entries in the configuration reference.
- Keep code comments focused on *why*, not *what*.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
