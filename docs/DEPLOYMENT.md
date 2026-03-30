# Deployment Guide

AIDrivenCompany supports three deployment modes. Pick the one that fits your situation and you should be up and running in under 10 minutes.

---

## 1. Local Development

Best for hacking on features or evaluating the product.

### Prerequisites

- Node.js 22+
- pnpm 9+

### Quick Start

```bash
git clone https://github.com/your-org/aidrivencompany.git
cd aidrivencompany
pnpm install
pnpm dev
```

This starts everything:

| Service | URL |
|---------|-----|
| API server | `http://localhost:3100` |
| UI (Vite HMR) | `http://localhost:5173` |

The Vite dev server proxies API requests to port 3100 automatically.

### Database

SQLite is used in development -- zero configuration required. The database file is created automatically at:

```
~/.aidrivencompany/dev.db
```

No external services, no Docker, no database server. Just `pnpm dev` and go.

---

## 2. Self-Hosted (Docker)

Best for teams running on their own infrastructure.

### Quick Start

```bash
docker compose up
```

The included `docker-compose.yml` defines two services:

```yaml
services:
  app:
    build: .
    ports:
      - "3100:3100"
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3100/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: aidrivencompany
      POSTGRES_USER: aidrivencompany
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aidrivencompany"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  uploads:
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required
DATABASE_URL=postgresql://aidrivencompany:yourpassword@postgres:5432/aidrivencompany
SESSION_SECRET=generate-a-strong-random-string-here

# AI features (optional but recommended)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # used for embeddings

# Server
PORT=3100                       # default 3100
NODE_ENV=production
DEPLOYMENT_MODE=private         # local | private | public
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Signs session cookies -- use a long random value |
| `ANTHROPIC_API_KEY` | No | Enables AI-powered features (Claude) |
| `OPENAI_API_KEY` | No | Enables vector embeddings |
| `PORT` | No | Server port (default `3100`) |
| `NODE_ENV` | No | `development` or `production` |
| `DEPLOYMENT_MODE` | No | `local`, `private`, or `public` |

### Health Check

Verify the deployment is healthy:

```bash
curl http://localhost:3100/api/health
```

### Backup and Restore

```bash
# Backup the database
pnpm db:backup

# Or use pg_dump directly
docker compose exec postgres pg_dump -U aidrivencompany aidrivencompany > backup.sql

# Restore from backup
cat backup.sql | docker compose exec -T postgres psql -U aidrivencompany aidrivencompany
```

### Reverse Proxy with Caddy (Auto-HTTPS)

Caddy handles TLS certificates automatically. Create a `Caddyfile`:

```
yourdomain.com {
    reverse_proxy localhost:3100
}
```

Then run:

```bash
caddy run
```

Caddy provisions and renews HTTPS certificates from Let's Encrypt with no additional configuration.

---

## 3. Hosted (Cloud)

Best for teams that want zero infrastructure management.

### Fly.io

```bash
# Install the Fly CLI, then:
fly launch
fly secrets set DATABASE_URL="..." SESSION_SECRET="..." ANTHROPIC_API_KEY="..."
fly deploy
```

The included `fly.toml` configures the app:

```toml
[build]

[http_service]
  internal_port = 3100
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[checks]
  [checks.health]
    port = 3100
    type = "http"
    interval = "30s"
    timeout = "5s"
    path = "/api/health"
```

### Railway

Click the one-click deploy button in the repository README or:

```bash
railway init
railway up
```

Railway auto-detects the project and provisions a PostgreSQL instance.

### Managed PostgreSQL

Any of these work as your production database:

- **Supabase** -- generous free tier, Postgres extensions included
- **Neon** -- serverless Postgres with branching, scales to zero
- **Platform-provided** -- Fly Postgres, Railway Postgres, Render Postgres

Set `DATABASE_URL` to the connection string from your provider. No other database configuration needed.

### Environment Variables

All cloud platforms support secrets management:

```bash
# Fly.io
fly secrets set KEY=value

# Railway
railway variables set KEY=value
```

Set the same variables listed in the self-hosted section above.

### Auto-Scaling

- Set `min_machines_running` in `fly.toml` to control baseline capacity
- The app is stateless (database is external), so horizontal scaling works out of the box
- For high-traffic deployments, use connection pooling (PgBouncer or Supabase pooler)

---

## Database Management

### Development vs Production

| | Development | Production |
|---|---|---|
| Engine | SQLite | PostgreSQL |
| Config | Zero -- auto-created | Set `DATABASE_URL` |
| Concurrency | Single writer | Full multi-tenant |
| Location | `~/.aidrivencompany/dev.db` | Remote or containerized |

### Migrations

Drizzle ORM runs migrations automatically on startup. No manual step needed in most cases.

For manual control:

```bash
# Run pending migrations
pnpm db:migrate

# Back up the database
pnpm db:backup
```

### Switching Databases

The app selects the database engine based on `DATABASE_URL`:

- If `DATABASE_URL` is set and starts with `postgresql://` -- uses PostgreSQL
- Otherwise -- uses embedded SQLite

---

## Security Considerations

- **Always use HTTPS in production.** Caddy or your cloud platform handles this.
- **Set a strong `SESSION_SECRET`.** Generate one with `openssl rand -hex 32`.
- **Never expose `DATABASE_URL`.** Use platform secrets or `.env` files excluded from version control.
- **API keys are encrypted at rest** in the database -- not stored in plaintext.
- **Rate limiting is enabled by default** on all API endpoints.
- **Keep dependencies updated.** Run `pnpm audit` periodically.
