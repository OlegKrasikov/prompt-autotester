# Product Overview

Internal tool for managing prompts, variables, and scenarios, and testing prompt versions against conversation flows.

## Core Flows

- Prompts: create/edit, tag, status (draft/published/archived), duplicate
- Scenarios: user/expect steps with expectations, publish for testing
- Testing: select published prompt and scenario, edit variant, stream results, optionally overwrite stored prompt
- Settings: manage encrypted API keys

## Key Routes

- `/prompts`, `/prompts/new`, `/prompts/[id]/edit`
- `/scenarios`, `/scenarios/new`, `/scenarios/[id]/edit`
- `/testing`
- `/variables`
- `/settings`

## APIs

- `/api/prompts` CRUD (+ duplicate)
- `/api/scenarios` CRUD, `/api/scenarios/published`
- `/api/user/api-keys` (GET/POST/DELETE), `/api/user/api-keys/validate`
- `/api/simulate` (SSE stream for test runs)

## Code Map (selected)

- `src/components/PromptForm.tsx`
- `src/components/ScenarioEditor.tsx`
- `src/components/PromptPicker.tsx`
- `src/components/ScenarioPicker.tsx`
- `src/components/PromptDiff.tsx`
- `src/components/PromptEditor.tsx`
- `src/components/ConversationView.tsx`
- `src/components/ui/*` (Card, Button, Input, Select, Textarea, Spinner, Modal)
- `src/app/testing/page.tsx`
- `src/app/api/simulate/route.ts`
- `src/app/api/auth/[...all]/route.ts`
- `src/app/api/prompts/*`, `src/app/api/scenarios/*`
- `src/app/api/user/api-keys/*`
- `src/lib/types.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/prisma.ts`

## Data Types (high level)

- ChatMessage { role: `system`|`user`|`assistant`; content: string }
- Conversation { title: string; messages: ChatMessage[] }
- SimulateRequestBody { oldPrompt, newPrompt, scenarioKey, modelConfig? }
- SimulateResponseBody { old: Conversation; new: Conversation }
- Scenario: status, locale, turns (USER/EXPECT), expectations
- Prompt: id, userId, name, description?, content, status, tags, timestamps
