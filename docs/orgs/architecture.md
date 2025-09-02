Organizations Architecture

Data Model

- organizations(id, name, slug, created_by_user_id, timestamps)
- organization_members(org_id, user_id, role, status, timestamps)
- organization_invitations(id, org_id, email, role, token, expires_at, invited_by_user_id, accepted_by_user_id?, status)
- user_profile(user_id, last_active_org_id)

Request Context

- Resolve active_org_id via UserProfile; enforce via API wrappers; RBAC centralized.

Session

- Session remains compatible; org claims added progressively.
