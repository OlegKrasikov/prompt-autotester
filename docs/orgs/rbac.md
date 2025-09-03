RBAC

Roles

- Admin: full access
- Editor: full read/write on domain resources (prompts, scenarios, variables); cannot access Settings or manage Members
- Viewer: read-only for domain resources; can use Testing but cannot update prompts

Policy

- Centralized via server/auth/rbac.ts `can(action, resource, role)`.
- Permissions map:
  - Settings & Member management: Admin
  - Write (create/update/delete) scenarios/prompts/variables: Admin, Editor
  - Read: all roles
  - Update Prompt in Testing: Admin, Editor only
