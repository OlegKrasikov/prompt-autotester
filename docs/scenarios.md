# Scenarios

User-owned conversation flows with USER/EXPECT turns and validation rules. Published scenarios are selectable in testing.

## Architecture

- API routes: `src/app/api/scenarios/*`, `src/app/api/scenarios/published`
- Service: `src/server/services/scenariosService.ts`
- Validation: `src/server/validation/schemas.ts`; enums in `src/lib/constants/enums.ts`

## Models (Prisma)

```prisma
model Scenario {
  id           String         @id @default(uuid())
  userId       String         @map("user_id")
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

## Endpoints

- `GET/POST /api/scenarios` – list/create (owner)
- `GET/PUT/DELETE /api/scenarios/[id]` – read/update/delete (owner)
- `POST /api/scenarios/[id]/duplicate` – duplicate (owner)
- `GET /api/scenarios/published` – published list for current user (testing)

## UI

- `/scenarios`: list with search/filter and actions (edit, duplicate, delete)
- `/scenarios/new`, `/scenarios/[id]/edit`: editor with ordered USER/EXPECT steps and expectations
- Published scenarios appear in `ScenarioPicker` on `/testing`

