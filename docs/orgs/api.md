Organizations API

Endpoints

- GET `/api/orgs`: List my orgs with role and active flag.
- POST `/api/orgs`: Create org; creator becomes Admin.
- POST `/api/orgs/:id/switch`: Switch active org.
- PATCH `/api/orgs/:id`: Rename organization (Admin of target org).
- DELETE `/api/orgs/:id`: Delete organization (Admin of target org). Response includes `nextOrgId` hint for client switching when deleting the active org.
- GET `/api/orgs/:id/members`: List members (active org only).
- POST `/api/orgs/:id/members/invite`: Create invite (Admins). No email is sent.
- PATCH `/api/orgs/:id/members/:userId`: Change role (Admins).
- DELETE `/api/orgs/:id/members/:userId`: Remove member (Admins, not last Admin).

Invitation Acceptance (No Email)

- Pending invitations keyed by email are auto-accepted upon login/signup of that email.
- No token endpoints are exposed; acceptance is handled centrally in auth context resolution.

Auth

- Requires Better Auth session.
- Org context resolved via UserProfile.lastActiveOrgId.

User API Keys

- GET `/api/user/api-keys`: List active provider keys for the current org (all roles, read‑only metadata; values are encrypted server‑side).
- POST `/api/user/api-keys`: Create/replace provider key for org (Admins only).
- DELETE `/api/user/api-keys?provider=openai`: Deactivate key (Admins only).
