# CLAUDE.md

Guidance for working with this repository.

## Documentation

- `docs/auth.md`: Authentication (Better Auth + Prisma), middleware, session management
- `docs/design-system.md`: Shared UI components and tokens
- `docs/modal-system.md`: Modal components and hooks
- `docs/database.md`: Prisma/Neon Postgres setup and schema
- `docs/skeleton.md`: Product overview and code map
- `docs/prompts.md`: Prompt management (models, APIs, UI)
- `docs/scenarios.md`: Scenario management (models, APIs, UI)
- `docs/variables.md`: Variables system and resolution
- `docs/testing.md`: Testing interface and simulation API
- `docs/code-style.md`: Code style (Prettier + ESLint), editor, CI

## Commands

```bash
# Dev
npm run dev
npm run build
npm start
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Prisma / DB
npm run prisma:generate
npm run prisma:studio
npm run prisma:pull
npm run prisma:push
npx prisma migrate dev --name <migration_name>

# Install (generates Prisma client)
npm i
```

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Better Auth (email/password)
- Prisma ORM + Neon Postgres
- TailwindCSS 4
 - Prettier + ESLint (Flat config) with Tailwind class sorting

## Code Style

- Prettier is the source of truth for formatting. See `docs/code-style.md`.
- ESLint integrates with Prettier via `eslint-config-prettier`.
- Unused vars/args prefixed with `_` are allowed by lint rules.
- CI enforces `format:check` and `lint` on PRs.

## Conventions

- Pages: For dynamic routes on React 19, `params` may be a `Promise`. Use `React.use(params)` to unwrap when needed (see `src/app/scenarios/[id]/edit/page.tsx`).
- API routes: The route handler context param is typed as `any` for broad Next.js compatibility.
- Unified error shape via `src/server/http/responses.ts`.

## Core Flow

- Create prompts, variables (`{{key}}`), and scenarios
- Configure OpenAI API key in Settings
- On `/testing`, select a published prompt, edit an alternative, pick a scenario and model
- Variables are resolved server-side; simulation streams via SSE for both prompts
- Compare results; optionally overwrite the stored prompt with the edited content

## Key Files

- `src/app/testing/page.tsx`: Testing interface
- `src/app/api/simulate/route.ts`: OpenAI integration + SSE streaming
- `src/app/api/user/api-keys/route.ts`: Encrypted API key management
- `src/lib/types.ts`: Core types (ChatMessage, Conversation, Scenario\*)
- `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/prisma.ts`
- `middleware.ts`: Route protection

## Environment

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=...   # Required for API key encryption
```

## Auth Notes

- Root pages are protected by middleware; unauthenticated users are redirected to login
- Better Auth handler mounted at `/api/auth/[...all]`
