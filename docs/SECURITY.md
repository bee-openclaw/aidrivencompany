# Security

This document describes the security model for AIDrivenCompany. It covers how we protect user data, isolate tenants, secure APIs, and constrain AI agents. Every contributor should read this before touching authentication, data access, or agent code.

---

## 1. Authentication & Authorization

AIDrivenCompany uses **Better Auth** for user authentication.

- **Sign-in methods**: Email/password and OAuth providers (Google, GitHub, etc.).
- **API access**: JWT tokens issued on login, short-lived with refresh rotation.
- **Role-based access control**: Every user has a role scoped to a company -- Owner, Admin, Member, or Viewer. Permissions are checked on every request.
- **Agent authentication**: Agents authenticate via API keys, not user sessions. Each key is scoped to specific permissions (see Section 5).
- **Session management**: Sessions use secure, HTTP-only, SameSite cookies. Tokens are rotated on privilege changes.

### What each role can do

| Action                  | Owner | Admin | Member | Viewer |
|-------------------------|-------|-------|--------|--------|
| Manage billing          | Yes   | No    | No     | No     |
| Invite/remove users     | Yes   | Yes   | No     | No     |
| Create/edit projects    | Yes   | Yes   | Yes    | No     |
| Configure agents        | Yes   | Yes   | No     | No     |
| View dashboards         | Yes   | Yes   | Yes    | Yes    |
| Access secrets          | Yes   | Yes   | No     | No     |

---

## 2. Multi-Tenant Isolation

AIDrivenCompany is multi-tenant by default. Isolation is enforced at every layer.

- **Database queries**: Every query is scoped to `company_id`. There are no global queries for tenant data.
- **Middleware**: A middleware layer resolves and enforces the company context on every route. Requests without a valid company context are rejected.
- **Cross-company access**: Impossible by design. No API endpoint returns data from another company, even for platform admins.
- **Company secrets**: Encrypted with per-company keys derived from a master key. Compromising one company's data does not expose another's.
- **File uploads**: Stored in company-specific paths. Access requires both authentication and matching `company_id`.

### How to verify isolation

When writing a new query or endpoint, confirm:

1. The query includes a `WHERE company_id = ?` clause (or equivalent Drizzle filter).
2. The `company_id` comes from the authenticated session, never from user input.
3. File paths include the company identifier.

---

## 3. Data Protection

### Encryption

- **Secrets at rest**: Encrypted using AES-256-GCM before storage. Decrypted only at the point of use.
- **API keys**: Hashed with bcrypt in the database. Raw keys are shown once at creation, then never again.
- **LLM API keys**: Stored encrypted. Never included in logs, error messages, or API responses.

### Personal data

- **Minimal collection**: We collect only what is needed -- email, name, and company association.
- **Encrypted storage**: PII fields are encrypted at rest.
- **GDPR-ready**: Users can export all their data and request full deletion. Company owners can remove a user and all associated data.

---

## 4. API Security

Every API endpoint is protected by multiple layers.

- **Rate limiting**: Applied to all endpoints. Configurable per route, with stricter limits on authentication endpoints.
- **Input validation**: Every route validates input with Zod schemas. Malformed requests are rejected before reaching business logic.
- **CORS**: Configured per deployment mode. Production restricts origins to the deployed domain. Development allows localhost.
- **CSRF protection**: All mutation endpoints (POST, PUT, DELETE) require a valid CSRF token.
- **Request size limits**: 10MB default. Configurable per route for file upload endpoints.
- **SQL injection prevention**: Drizzle ORM uses parameterized queries exclusively. Raw SQL is never constructed from user input.

### Example: validated endpoint

```ts
const schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

app.post("/api/projects", validate(schema), requireRole("Member"), async (req, res) => {
  // company_id comes from session, not request body
  const project = await db.insert(projects).values({
    ...req.body,
    companyId: req.session.companyId,
  });
  return res.json(project);
});
```

---

## 5. Agent Security

AI agents have access to company data and external APIs. Their permissions are tightly controlled.

- **Sandboxed execution**: Agents run in isolated environments. They cannot access the host filesystem, network, or other agents' state.
- **Budget enforcement**: Every agent has a cost budget. When the budget is exhausted, the agent stops. No exceptions.
- **Approval gates**: Sensitive operations (sending emails, modifying billing, deleting data) require human approval before execution.
- **Audit logging**: Every action an agent takes is recorded -- what it did, when, with what parameters, and the result.
- **Scoped API keys**: Agent API keys have one of three permission levels:
  - `read-only` -- Can read company data, cannot modify anything.
  - `read-write` -- Can read and modify data within its assigned scope.
  - `admin` -- Full access. Reserved for system-level agents, requires Owner approval.

### Agent key lifecycle

1. Owner or Admin creates an agent key with a specific scope.
2. The raw key is displayed once and must be stored securely.
3. The key is hashed and stored in the database.
4. Keys can be rotated or revoked at any time from the dashboard.
5. Revoked keys are rejected immediately on the next request.

---

## 6. Infrastructure Security

- **Non-root containers**: Docker containers run as a non-root user. The Dockerfile sets `USER` explicitly.
- **No secrets in images**: Docker images contain no secrets, tokens, or API keys. All configuration is injected via environment variables at runtime.
- **Environment variables**: All configuration (database URLs, API keys, feature flags) is passed through environment variables, never hardcoded.
- **Health endpoints**: The `/health` endpoint returns only status information (`ok` or `error`). It does not expose versions, configuration, or internal state.
- **Dependency auditing**: Run `pnpm audit` before every release. Known vulnerabilities in dependencies block deployment.

---

## 7. Responsible Disclosure

We welcome security reports from researchers and users.

- **Contact**: security@aidrivencompany.com
- **Disclosure timeline**: We commit to a 90-day timeline from report to public disclosure.
- **Safe harbor**: We will not take legal action against researchers who report vulnerabilities in good faith, follow responsible disclosure practices, and do not access or modify other users' data.
- **Credit**: Researchers who report valid vulnerabilities are credited in our security advisories (unless they prefer to remain anonymous).

### What to include in a report

- Description of the vulnerability.
- Steps to reproduce.
- Potential impact.
- Suggested fix (optional, but appreciated).

---

## 8. Security Checklist for Contributors

Before submitting code that touches authentication, data access, or agent behavior, verify the following:

- [ ] **No logged secrets**: Secrets, tokens, and API keys are never written to logs, console output, or error messages.
- [ ] **Input validated**: All user input is validated with Zod schemas before processing.
- [ ] **Queries scoped**: Every database query that touches tenant data includes a `company_id` filter.
- [ ] **No string SQL**: SQL is never built with string concatenation or template literals. Use Drizzle ORM's query builder.
- [ ] **CORS intact**: CORS settings are not relaxed in production configuration.
- [ ] **Parameterized queries**: All queries use parameterized values, never interpolated strings.
- [ ] **OWASP reviewed**: If the change touches authentication, authorization, or data handling, review the [OWASP Top 10](https://owasp.org/www-project-top-ten/) for applicable risks.

### Quick self-test

Ask yourself: "If a malicious user controlled every field in this request, could they access another company's data, escalate their role, or extract secrets?" If the answer is anything but a clear no, revisit the implementation.
