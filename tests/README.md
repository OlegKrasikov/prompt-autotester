Integration Tests

Overview

- Tests use Node’s built-in `node:test`. Some tests are unit-level (RBAC) and run without a DB.
- API and DB-backed tests require a running Postgres and Next.js dev server with Better Auth configured.

Setup

1. Copy `.env.example` to `.env` and set DATABASE_URL, BETTER_AUTH_SECRET, ENCRYPTION_KEY.
2. Run `npm run prisma:push` to apply schema.
3. Start dev server: `npm run dev`.

Running

- Unit tests (pure): `node --test tests/rbac.test.ts`
- Orgs e2e (requires dev server):
  - Start Next.js: `npm run dev`
  - Set `TEST_BASE_URL` if not default (http://localhost:3000)
  - Run: `node --test tests/api.orgs.integration.mjs`
  - Note: tests are marked skip; remove `.skip` to run.

Planned Tests

- Org lifecycle: personal org auto-create on first login.
- Org switching: POST /api/orgs/:id/switch persists context.
- Invitations: creating invites and auto-accepting on login (no email/token flow).
- Members RBAC: Admin-only updates/removals; last Admin protection.
- Scoping: resources created in active org are visible under that org.

Notes

- Better Auth session is maintained via a simple cookie jar in `tests/utils/http.mjs`.
- Use unique emails per test run to avoid collisions.
