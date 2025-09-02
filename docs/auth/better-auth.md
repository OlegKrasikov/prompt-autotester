Better Auth Integration

Overview

- Session carries identity. Org context stored in DB (UserProfile.lastActiveOrgId) and can be injected into session claims later.
- Signup: auto-create Personal org, grant Admin, set active org.

Claims (target)

- active_org_id, org_role, org_ids, user_id, email.

Hooks

- Post-signup: if user has no memberships, auto-create Personal org (shadow mode) and set active.
- Login/Session resolve: auto-accept any pending invitations that match the user email (no email/token required).
- Org switch: refresh session to update org claims (TODO when Better Auth hooks available).
