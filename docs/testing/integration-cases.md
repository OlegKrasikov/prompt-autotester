Integration Cases

Signup

- Creates personal org; sets active_org_id; Admin role.

Org Switching

- GET /api/orgs; POST switch; session persists; access checks.

Invitations

- Create invite; accept with new/existing user; expired; duplicate/member.

Middleware/Auth

- Unauthorized; org required; RBAC matrix across members endpoints.

Migration

- Shadow mode: personal org auto-create; idempotency; counters.

Testing UI

- All roles can run prompt simulations on `/testing`.
- Viewer cannot use “Update Prompt”; Admin/Editor can.
- API keys presence check (GET /api/user/api-keys) should succeed for any role; write endpoints restricted to Admin.
