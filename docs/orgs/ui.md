UI

Workspace Switcher (Sidebar Popover)

- User block in the left sidebar opens a compact popover menu.
- Shows a list of workspaces (orgs) with the active one marked; click switches via POST `/api/orgs/:id/switch`.
- Hover actions (Admin only) on the active row: rename (pencil) and delete (trash). You can also rename/delete any org where you are Admin directly from the menu without switching first.
- “Create workspace” opens a minimal modal to name and create a new org; the client switches automatically after creation.

Header

- Displays the current workspace name and role chip; mirrors the sidebar selection.

Members

- Table/list: name/email, role (editable for Admin), status, actions.
- Uses members API; prevents removing the last Admin; 403s are handled with friendly messages.

Invitations

- Modal form: email + role; shows pending invites; resend/revoke controls.
- Users with matching email auto‑accept on login/signup.

Routing Guards

- Settings is available to Admin only (server‑enforced; client hides link).
- Variables/Prompts/Scenarios:
  - Admin/Editor: create/edit/delete.
  - Viewer: read‑only. All roles can open the Testing page and run simulations, but Viewer cannot “Update Prompt”.
