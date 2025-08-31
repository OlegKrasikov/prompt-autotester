# Authentication

This app uses Better Auth with Prisma and Neon Postgres.

- Server config: `src/lib/auth.ts`
- API routes: `src/app/api/auth/[...all]/route.ts`
- Client SDK: `src/lib/auth-client.ts`
- UI: `src/components/Sidebar.tsx` (user info/logout), pages `/login`, `/signup`
- Middleware protection: `src/middleware.ts` (protects `/testing`, `/scenarios`, `/variables`, `/settings`) and injects `x-request-id` for logs

## Setup

1. Env

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=...   # required for saving/updating API keys
```

### Generating ENCRYPTION_KEY

We derive a 32‑byte key from `ENCRYPTION_KEY` using scrypt. Any high‑entropy value works; recommend ≥32 random bytes.

Examples

- macOS/Linux (hex): `openssl rand -hex 32`
- macOS/Linux (base64): `openssl rand -base64 32`
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Python: `python - <<'PY'\nimport secrets; print(secrets.token_hex(32))\nPY`
- Windows PowerShell: `powershell -Command "[Convert]::ToBase64String((New-Object byte[] 32 | %{(Get-Random -Max 256)}))"`

2. Schema and DB

```
npx @better-auth/cli generate --config src/lib/auth.ts --yes
npx prisma migrate dev --name betterauth_init
```

3. Generate client on install (configured in `package.json`):

```
npm i
```

## How it works

- Better Auth stores users/sessions in Postgres via Prisma.
- Middleware checks cookies for `better-auth.session_token` to validate sessions and injects a per-request `x-request-id` header for traceable logs.
- Protected routes (`/testing`, `/scenarios`, `/variables`, `/settings`) redirect unauthenticated users to `/login?redirect=[route]`.
- Client components use `authClient.useSession()` to render user info and logout in sidebar.
- Landing page `/` is public, authenticated users can access all app features.

## Primary endpoints

- `GET/POST /api/auth/[...all]` – Better Auth handler
- `GET /api/auth/get-session` – returns current session (used by middleware)
  - In API routes, prefer `getCurrentUser(request)` from `src/lib/utils/auth-utils.ts` over raw handler calls.
- Sign-in: `authClient.signIn.email({ email, password })`
- Sign-up: `authClient.signUp.email({ name, email, password })`
- Sign-out: `authClient.signOut()`

## Files

- `src/lib/auth.ts`: Better Auth instance using Prisma adapter
- `src/lib/prisma.ts`: Prisma client (singleton)
- `src/app/api/auth/[...all]/route.ts`: exposes handler
- `src/lib/auth-client.ts`: React client from `better-auth/react`
- `src/middleware.ts`: protects `/testing`, `/scenarios`, `/variables`, `/settings` routes
- `src/components/Sidebar.tsx`: user info display and logout button
- `src/components/Header.tsx`: session-aware header (login/signup pages only)
- `src/app/login/page.tsx`, `src/app/signup/page.tsx`: auth forms
- `src/app/layout-client.tsx`: conditional UI layout based on auth status

## Middleware Implementation Details

**Important**: The middleware file must be located at `src/middleware.ts` for Next.js 15 with App Router.

### Authentication Check Strategy

The middleware uses a cookie-based authentication check:

1. **Primary check**: Looks for `better-auth.session_token` cookie
2. **Fallback**: API call to `/api/auth/get-session` if cookie check fails
3. **Performance**: Cookie check is faster and more reliable than API calls in middleware

### Protected Routes

Currently protected routes that require authentication:

- `/testing` - Prompt testing interface
- `/scenarios` - Scenario management
- `/variables` - Variables management
- `/settings` - User settings and AI model API key configuration

### Troubleshooting

If middleware isn't working:

1. Ensure file is at `src/middleware.ts` (not project root)
2. Restart development server after moving middleware
3. Check console logs for middleware execution messages
4. Verify cookies are being set correctly after login
