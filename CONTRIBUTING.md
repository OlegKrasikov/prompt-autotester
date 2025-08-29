# Contributing

Thanks for your interest in contributing! We welcome issues and pull requests.

## Getting Started
- Fork and clone the repo.
- Install deps: `npm install`
- Create `.env` from `.env.example` and fill values.
- Prepare DB: `npx prisma generate && npx prisma db push`
- Start dev: `npm run dev`

## Development Guidelines
- Keep changes focused and minimal.
- Add or update docs in `README.md` or `docs/` when behavior changes.
- Ensure `npm run lint` passes.

## Pull Requests
- Describe the problem and solution clearly.
- Link related issues.
- Add screenshots/gifs for UI changes when useful.
- Avoid including unrelated refactors.

## Issue Reports
- Use the templates in `.github/ISSUE_TEMPLATE`.
- Include reproduction steps, expected vs. actual behavior, and environment info.

## Security Reports
Do not file public issues. See `SECURITY.md` for private reporting.

