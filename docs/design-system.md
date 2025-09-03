# Design System

Shared tokens and components used across the app.

## Tokens

- Defined in `src/app/globals.css` (colors, radii, shadows)
- Use CSS custom properties via Tailwind arbitrary values (e.g., `bg-[color:var(--color-surface)]`)

## Fonts

- Font families are defined via CSS variables in `src/app/globals.css`:
  - `--font-geist-sans` and `--font-geist-mono` default to system fallbacks.
- We do not fetch Google Fonts at build/runtime to keep CI and sandbox environments network-agnostic. If desired, reintroduce `next/font` with self-hosting in a dedicated change.

## Core UI Components

- `src/components/ui/Card.tsx`: Card with variants and padding options
- `src/components/ui/Button.tsx`: Variants (`primary`, `secondary`, `ghost`, `danger`, `success`) and sizes (`sm`, `md`, `lg`)
- `src/components/ui/Input.tsx`: Labeled input with error state
- `src/components/ui/Select.tsx`: Styled select with label
- `src/components/ui/Textarea.tsx`: Labeled textarea
- `src/components/ui/Spinner.tsx`: Loading indicator (`sm`, `md`, `lg`)
- `src/components/ui/Modal.tsx`: Base modal primitives
- `src/components/ui/ConfirmationModal.tsx`: Confirm dialog
- `src/components/ui/AlertModal.tsx`: Alert/info dialog

## Patterns

- Sidebar user popover menu for workspace switching and quick actions (rename/delete on hover, Admin only).
- Inline skeletons/spinners for role‑dependent actions to avoid button flicker (e.g., Actions column while role loads).

## Hooks & Utilities

- `src/hooks/useModal.ts`: `useModal`, `useConfirmModal`, `useAlertModal`
- `src/utils/formatMessage.tsx`: Multiline/compact message formatting

## Guidelines

- Use tokens; avoid hardcoded colors/sizes
- Reuse component variants; avoid custom one-offs
- Keep page structure consistent; prefer Card sections
- Provide loading, error, and disabled states for actions
- Ensure accessibility (labels, roles, focus, contrast)
