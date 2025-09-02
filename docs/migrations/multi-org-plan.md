Multi-Org Migration Plan

Flags

- org_shadow_mode, enforce_org_context, rbac_enforcement, invite_flow_enabled.

Steps

1. Add org models + optional orgId on resources (shadow).
2. Backfill (dry run): `node scripts/backfill-orgs.mjs --dry-run` and verify counts.
3. Backfill (execute): `npm run backfill:orgs` and verify coverage metrics.
4. Apply migration: `prisma migrate deploy` to enforce non-null org_id and org-scoped unique indexes.
5. Enable strict flags in env: `ENFORCE_ORG_CONTEXT=true`, `RBAC_ENFORCEMENT=true`, `INVITE_FLOW_ENABLED=true`.
6. Enable session org claims: set cookies (current) or Better Auth hooks (preferred) to inject `active_org_id` and `org_role` into the session.
7. Post-verify: run E2E + integration tests; monitor 401/403 metrics.

Validation

- Idempotent backfill; metrics on coverage; audit logs.
