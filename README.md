# Prompt Autotester

Compare prompt versions across real conversation scenarios and see the differences live. Build suites, set expectations, and iterate fast with side‑by‑side streaming output.

<p align="center">
  <img src="https://github.com/user-attachments/assets/90782f5e-39ff-4d00-802f-0cc9af5648fe" width="960" height="540" hspace="10"/>
</p>

## Features
- Side‑by‑side simulation: stream model responses for “current” vs “edited” prompts
- Scenarios & suites: organize multi‑turn conversations
- Secure key vault: user API keys encrypted at rest with AES‑256‑CBC

## Tech Stack
- Next.js 15 (App Router)
- React 19, TailwindCSS 4
- Prisma 6 + PostgreSQL
- better-auth (Email+Password enabled by default)
- OpenAI SDK

## Quick Start
Prerequisites
- Node.js 20+ and npm 10+
- Git
- Postgres database (local Docker or hosted like Neon)

1) Install dependencies
```
npm install
```

2) Configure environment
- Copy `.env.example` to `.env` and fill values:
  - `DATABASE_URL` – PostgreSQL connection string
  - `BETTER_AUTH_SECRET` – strong secret for auth
  - `BETTER_AUTH_URL` – e.g. `http://localhost:3000`
  - `ENCRYPTION_KEY` – strong secret used to encrypt/decrypt user API keys (required)

3) Prepare the database
```
npx prisma generate
npx prisma db push
```
If you edit `prisma/schema.prisma`, re‑run `db push` to sync.

4) Start the dev server
```
npm run dev
```
Visit http://localhost:3000

### Option A: Local Postgres (Docker)
Start a Postgres container locally:
```
docker run --name prompt-autotester-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:16
```
Then set in `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```

### Option B: Hosted Postgres (Neon, etc.)
Create a database and copy its connection string into `DATABASE_URL`. For many providers, you may need `?sslmode=require`.

## First‑Run Walkthrough
1) Open the app at http://localhost:3000
2) Sign up (email + password)
3) Go to Settings → add your OpenAI API key (stored encrypted)
4) Create a scenario (or use existing ones), write/edit a prompt
5) Run a simulation to compare “current” vs “edited” prompts side‑by‑side

## Environment Variables
- `DATABASE_URL`: Postgres connection string. In CI we use a temporary Postgres.
- `BETTER_AUTH_SECRET`: secret for session/signing. Keep it private.
- `BETTER_AUTH_URL`: your app base URL. Example: `http://localhost:3000` in dev.
- `ENCRYPTION_KEY`: required. Derives a 32‑byte key to encrypt API keys. Do not share.

Notes
- `.env` is ignored by Git; never commit real secrets. Use `.env.example` to document.
- The app throws if `ENCRYPTION_KEY` is missing for encryption/decryption operations.
- Legacy decryption paths exist for migration only and are safe to remove later.

### Generate ENCRYPTION_KEY
Any high‑entropy secret works (we derive a 32‑byte key via scrypt). Recommended ≥32 random bytes.

Commands
- macOS/Linux (hex): `openssl rand -hex 32`
- macOS/Linux (base64): `openssl rand -base64 32`
- Node.js: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Python: `python - <<'PY'\nimport secrets; print(secrets.token_hex(32))\nPY`
- Windows PowerShell: `powershell -Command "[Convert]::ToBase64String((New-Object byte[] 32 | %{(Get-Random -Max 256)}))"`

Place the value in your `.env`:

```
ENCRYPTION_KEY="<paste_generated_value>"
```

## Troubleshooting
- Postgres connection failed: ensure the container is running or the hosted DB is reachable; verify `DATABASE_URL` and port `5432`.
- ENCRYPTION_KEY missing: check `.env` is present and server restarted after adding it.
- Prisma errors: delete `.prisma` cache by re‑running `npx prisma generate` and then `npx prisma db push`.
- Port already in use: stop other Next.js instances or change the port `PORT=3001 npm run dev`.

## Security of API Keys
- User API keys are encrypted at rest using AES‑256‑CBC with an IV per value.
- Encryption key is derived from `ENCRYPTION_KEY` via `scrypt` (see `src/server/utils/crypto.ts`).
- Rotation: legacy‑encrypted values get re‑encrypted with the primary key when possible.

## Database
- ORM: Prisma. Schema lives at `prisma/schema.prisma`.
- Commands
  - Generate client: `npx prisma generate`
  - Apply schema: `npx prisma db push`
  - Inspect DB: `npx prisma studio`

## Development
- Lint: `npm run lint`
- Build: `npm run build`
- TypeScript config: `tsconfig.json`
- Tailwind v4 config via PostCSS

## Deployment
Common setup: Vercel + Neon/Postgres
- Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ENCRYPTION_KEY` as project env vars (never commit them).
- Run `prisma generate` during build (handled by `postinstall`).
- Optional: run `prisma db push` on deploy to sync schema.

## Contributing
We welcome issues and PRs! Please read `CONTRIBUTING.md` and follow the `CODE_OF_CONDUCT.md`.

## Security
Please report vulnerabilities privately using GitHub Security Advisories (see `SECURITY.md`). Do not open public issues for security reports.

## License
MIT — see `LICENSE`.
