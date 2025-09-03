# Scenarios

Org‑scoped conversation flows with USER/EXPECT turns and validation rules. Published scenarios are selectable in testing. Admin and Editor can write; Viewer is read‑only.

## Architecture

- API routes: `src/app/api/scenarios/*`, `src/app/api/scenarios/published`
- Service: `src/server/services/scenariosService.ts`
- Validation: `src/server/validation/schemas.ts`; enums in `src/lib/constants/enums.ts`

## Models (Prisma)

```prisma
model Scenario {
  id           String         @id @default(uuid())
  userId       String         @map("user_id")
  orgId        String         @map("org_id")
  name         String
  description  String?
  locale       String         @default("en")
  status       ScenarioStatus @default(DRAFT)
  version      Int            @default(1)
  tags         String[]       @default([])
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  turns        ScenarioTurn[]
  expectations ScenarioExpectation[]
  @@index([orgId, status, updatedAt], map: "idx_scenario_org_status_updated")
  @@unique([orgId, name], name: "idx_scenario_org_name_unique")
}

model ScenarioTurn {
  id          BigInt           @id @default(autoincrement())
  scenarioId  String
  orderIndex  Int
  turnType    ScenarioTurnType
  userText    String?
}

model ScenarioExpectation {
  id              BigInt          @id @default(autoincrement())
  scenarioId      String
  turnId          BigInt
  expectationKey  String
  expectationType ExpectationType
  argsJson        Json            @default("{}")
  weight          Int?
}
```

## Endpoints (Org‑scoped + RBAC)

- `GET/POST /api/scenarios` – list/create (Admin/Editor)
- `GET/PUT/DELETE /api/scenarios/[id]` – read/update/delete (Admin/Editor; read for all members)
- `POST /api/scenarios/[id]/duplicate` – duplicate (Admin/Editor)
- `GET /api/scenarios/published` – published list for active org

## UI

- `/scenarios`: list with search/filter and actions (edit, duplicate, delete — hidden for Viewer)
- `/scenarios/new`, `/scenarios/[id]/edit`: editor with ordered USER/EXPECT steps and expectations
- Published scenarios appear in `ScenarioPicker` on `/testing`
