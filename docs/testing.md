# Prompt Testing Interface

The testing page (`/testing`) compares two prompt versions against a selected scenario and model, streaming conversations for both versions side-by-side.

## Overview

- Select a published prompt, auto-fill "Current" and edit an "Edited" version
- Variable support: `{{key}}` autocomplete and validation
- Choose a published scenario and AI model
- Run simulation via SSE; results render live for both versions

## Components

- `PromptEditor.tsx`: Prompt input with variable autocomplete/highlighting
- `PromptDiff.tsx`: Word-level diff between current and edited prompts
- `ScenarioPicker.tsx`: Dropdown of published scenarios
- `PromptPicker.tsx`: Dropdown of published prompts (auto-fills editors)
- `ModelPicker.tsx`: Model selection with optional advanced options
- `ConversationView.tsx`: Streaming conversation display

## Simulation API

- Endpoint: `POST /api/simulate`
- Request body: `oldPrompt`, `newPrompt`, `scenarioKey`, optional `modelConfig`
- Response stream (SSE): events `start`, `message`, `complete`, `done`, `error`
- Variable resolution occurs server-side before OpenAI calls

## Error Handling

- Client validation: require prompt selection, scenario selection, and configured API key
- Server errors: propagate OpenAI/validation errors with clear messages
- Streaming: handle connection errors gracefully

## Authentication

- `/testing` is protected by middleware; unauthenticated users redirect to login

## File Structure

```
src/app/testing/page.tsx
src/components/PromptEditor.tsx
src/components/PromptPicker.tsx
src/components/PromptDiff.tsx
src/components/ScenarioPicker.tsx
src/components/ModelPicker.tsx
src/components/ConversationView.tsx
src/app/api/simulate/route.ts
src/app/api/scenarios/published/route.ts
```

