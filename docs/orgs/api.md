Organizations API

Endpoints

- GET `/api/orgs`: List my orgs with role and active flag.
- POST `/api/orgs`: Create org; creator becomes Admin.
- POST `/api/orgs/:id/switch`: Switch active org.
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
