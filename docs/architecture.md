# Architecture (Updated)

This app follows a layered design:

- Routes/Controllers: `src/app/api/**/route.ts`
  - Parse request, validate with Zod, call service, map to HTTP via `okJson/errorJson`.
- Services: `src/server/services/*Service.ts`
  - Business logic, DTO mapping, cross-entity workflows, transactions.
- Repos: `src/server/repos/*Repo.ts`
  - Data access via Prisma; no business logic.

## Validation

- Central Zod schemas: `src/server/validation/schemas.ts`.
- Shared enums/constants: `src/lib/constants/enums.ts` to avoid drift.
- Update schemas accept `description: string | null` where DB allows nulls.

## Logging & Observability

- Request IDs injected by `src/middleware.ts` (`x-request-id`).
- `src/server/logging/logger.ts` adds requestId to structured logs.

## OpenAI Integration

- Wrapper in `src/server/openai/client.ts` with timeout + retry/backoff.
- Simulation streams via SSE (`/api/simulate`). Consider heartbeat pings for long runs.

## Crypto & API Keys

- Central utils: `src/server/utils/crypto.ts` (AES‑256‑CBC).
- `ENCRYPTION_KEY` required for saving/updating keys. Simulation can decrypt legacy records and auto-rotate to current key.

## DTOs & Types

- UI/server share types via `src/lib/types.ts` and enums via `src/lib/constants/enums.ts`.
- Services return DTOs (e.g., `PromptListItem`, `VariableListItem`, `ScenarioListItem`) — no Prisma entities leak to clients.

## Files of Interest

- Prompts: `promptsService` / `promptsRepo` used by `src/app/api/prompts/*`.
- Variables: `variablesService` / `variablesRepo` used by `src/app/api/variables/*`.
- Scenarios: `scenariosService` used by `src/app/api/scenarios/*` and duplicates/published routes.

## Conventions

- Pages (React 19): Dynamic route params may be delivered as a `Promise`. Components may unwrap via `React.use(params)` where needed (see `src/app/scenarios/[id]/edit/page.tsx`).
- API routes: The handler's second argument (context) is currently typed as `any` for compatibility with Next.js types across versions.
- Unified error shape via `src/server/http/responses.ts`.
- Indices added in `prisma/schema.prisma` for common list queries.

## Frontend Fonts

- Fonts are provided via CSS variables in `src/app/globals.css` (e.g., `--font-geist-sans`, `--font-geist-mono`) with system fallbacks.
- We avoid network font fetches in CI and sandboxed environments. If you prefer Next.js `next/font`, consider self-hosting or gating by environment in a separate change.

## Code Style

- Prettier + ESLint enforce formatting and common lint rules. See `docs/code-style.md`.
