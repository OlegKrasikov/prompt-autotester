UI

Org Switcher

- Header dropdown using existing Select component.
- Calls POST `/api/orgs/:id/switch` then reloads.

Members

- Table/list: name/email, role (editable for Admin), status, actions.
- Uses members API; handles 403 gracefully.

Invitations

- Modal form: email + role; shows pending invites; no email is sent.
- Users with that email will see the org automatically after login/signup.

Routing Guards

- Hide Settings for non-Admins; server enforcement remains authoritative.
