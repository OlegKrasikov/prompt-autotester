# Code Style & Formatting

This repo uses Prettier for code formatting and ESLint for linting. The goal is a consistent, low‑friction developer experience across the team.

## Prettier

- Config: `.prettierrc.json`
- Ignore: `.prettierignore`
- Plugins: `prettier-plugin-tailwindcss` (sorts Tailwind classes)

Commands

- Format all files: `npm run format`
- Check only: `npm run format:check`

Commonly formatted file types: `js`, `jsx`, `ts`, `tsx`, `json`, `md`, `css`

## ESLint

- Flat config: `eslint.config.mjs`
- We extend `eslint-config-prettier` to disable formatting rules that conflict with Prettier.

Commands

- Lint: `npm run lint`
- Fix: `npm run lint:fix`

## VS Code

This repo includes workspace settings and recommended extensions in `.vscode/`:

- Default formatter: Prettier
- Format on save enabled
- Prisma formatter for `*.prisma`

You may need to install the recommended extensions if VS Code prompts you.

## CI

Our CI (disabled by default in `.github/workflows_disabled/ci.yml`) runs `npm run format:check` and `npm run lint` on PRs. To enable, move the workflow into `.github/workflows/`.

## Commit Hooks (optional)

If you want to format only changed files on commit, install Husky + lint-staged:

```
npm i -D husky lint-staged
npx husky init
```

Add to `package.json`:

```
"lint-staged": {
  "**/*.{js,jsx,ts,tsx,md,css,json,mdx}": [
    "prettier --write"
  ]
}
```

This is optional and can be introduced later.
