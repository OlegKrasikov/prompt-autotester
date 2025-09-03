# Prompts

Org‑scoped prompts (per workspace) with CRUD, tagging, and status; integrated with testing. Admin and Editor can write; Viewer is read‑only.

## Architecture

- API routes: `src/app/api/prompts/*`
- Service/Repository: `src/server/services/promptsService.ts`, `src/server/repos/promptsRepository.ts`
- Validation: `src/server/validation/schemas.ts`

## Model (Prisma)

```prisma
model Prompt {
  id          String       @id @default(uuid())
  userId      String       @map("user_id")
  orgId       String       @map("org_id")
  name        String
  description String?
  content     String       @db.Text
  status      PromptStatus @default(DRAFT)
  tags        String[]     @default([])
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization? @relation(fields: [orgId], references: [id], onDelete: Cascade)
  @@index([orgId, status, updatedAt], map: "idx_prompt_org_status_updated")
  @@unique([orgId, name], name: "idx_prompt_org_name_unique")
  @@map("prompt")
}
```

## Endpoints (Org‑scoped + RBAC)

- `GET /api/prompts` – list (search/status/tags filters) within active org
- `POST /api/prompts` – create (Admin/Editor; name unique per org)
- `GET /api/prompts/[id]` – read (member of org)
- `PUT /api/prompts/[id]` – update (Admin/Editor)
- `DELETE /api/prompts/[id]` – delete (Admin/Editor)
- `POST /api/prompts/[id]/duplicate` – copy as new DRAFT (Admin/Editor)

## UI

- `/prompts`: list with search/filters and actions (edit, copy, delete — hidden for Viewer)
- `/prompts/new`, `/prompts/[id]/edit`: form with name, description, content, status, tags
- Variable validation and highlighting in content (`{{key}}`)
- Published prompts shown in testing via `PromptPicker`
