# Database

We use Neon Postgres via Prisma as the ORM.

- Connection: `DATABASE_URL` (SSL required)
- Client: `src/lib/prisma.ts` (singleton)
- Schema: `prisma/schema.prisma`
- Migrations: Prisma migrate

## Models

### Authentication Models

Added by Better Auth CLI:

- `User` – core user profile
- `Session` – auth sessions
- `Account` – provider accounts (oauth/password)
- `Verification` – email verification & reset tokens

### Scenario Management Models

Added for test scenario management with user ownership:

- `Scenario` – core scenario definition with metadata (user-owned)
- `ScenarioTurn` – ordered steps within scenarios (User/Expect)
- `ScenarioExpectation` – validation rules for assistant responses
- `ScenarioVersion` – version history tracking (optional)
- `ScenarioSuite` – grouped scenarios for batch testing (user-owned)
- `ScenarioSuiteItem` – many-to-many relationship for suites

### Prompt Management Models

Added for prompt creation and testing workflows:

- `Prompt` – user-owned prompts with content and metadata
- `Variable` – user-owned key-value pairs for reusable content with unique key constraints

### User Settings Models

Added for user-specific configuration:

- `UserApiKey` – encrypted AI model API keys (user-isolated)

### Enums

- `ScenarioStatus` – DRAFT | PUBLISHED | ARCHIVED
- `ScenarioTurnType` – USER | EXPECT
- `ExpectationType` – MUST_CONTAIN | MUST_CONTAIN_ANY | MUST_NOT_CONTAIN | REGEX | SEMANTIC_ASSERT
- `PromptStatus` – DRAFT | PUBLISHED | ARCHIVED

See the current schema:

```prisma
// prisma/schema.prisma (excerpt)
model User {
  id             String          @id
  name           String
  email          String
  emailVerified  Boolean
  image          String?
  createdAt      DateTime
  updatedAt      DateTime
  sessions       Session[]
  accounts       Account[]
  scenarios      Scenario[]      // User's scenarios
  scenarioSuites ScenarioSuite[] // User's scenario suites
  prompts        Prompt[]        // User's prompts
  variables      Variable[]      // User's variables
  apiKeys        UserApiKey[]    // User's API keys
}

model Scenario {
  id           String                 @id @default(uuid()) // Auto-generated UUID
  userId       String                 @map("user_id")      // Owner reference
  name         String
  description  String?
  locale       String                 @default("en")
  status       ScenarioStatus         @default(DRAFT)
  version      Int                    @default(1)
  tags         String[]               @default([])
  createdAt    DateTime               @default(now())
  updatedAt    DateTime               @updatedAt

  user         User                   @relation(fields: [userId], references: [id], onDelete: Cascade)
  turns        ScenarioTurn[]
  expectations ScenarioExpectation[]
  versions     ScenarioVersion[]
  @@unique([userId, name], name: "idx_scenario_user_name_unique")
}

model ScenarioTurn {
  id          BigInt               @id @default(autoincrement())
  scenarioId  String
  orderIndex  Int
  turnType    ScenarioTurnType
  userText    String?

  scenario     Scenario @relation(fields: [scenarioId], references: [id])
  expectations ScenarioExpectation[]
}

model Prompt {
  id          String       @id @default(uuid())
  userId      String       @map("user_id")
  name        String
  description String?
  content     String       @db.Text
  status      PromptStatus @default(DRAFT)
  tags        String[]     @default([])
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("prompt")
}

model UserApiKey {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  provider  String   // 'openai', 'anthropic', etc.
  keyName   String   @map("key_name")
  encryptedKey String @map("encrypted_key") // AES-256-CBC encrypted
  isActive  Boolean  @default(true) @map("is_active") // Soft delete
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider], name: "idx_user_provider_unique")
  @@map("user_api_key")
}
```

## Performance

- Add appropriate indexes for frequent filters/sorts (userId, status, updatedAt). See `prisma/schema.prisma` for current indexes (Prompts, Scenarios, Variables, UserApiKey).
- Prefer `_count` aggregates for list summaries (e.g., total turns) instead of loading full relations.

## Uniqueness & Duplicates

- Scenarios enforce a unique `(userId, name)` constraint to prevent duplicates.
- Services translate Prisma unique violations (`P2002`) into a domain `DUPLICATE` error on create/duplicate.

## Commands

- Generate client: `npm run prisma:generate`
- Pull schema: `npm run prisma:pull`
- Push schema: `npm run prisma:push`
- Apply migration: `npx prisma migrate dev --name <migration_name>`
  - Initial auth setup: `npx prisma migrate dev --name betterauth_init`
  - Scenario system: `npx prisma migrate dev --name add_scenarios`
  - User-specific scenarios: `npx prisma migrate dev --name user_specific_scenarios`
  - User API keys: `npx prisma migrate dev --name add_user_api_keys`
  - Prompts management: `npx prisma migrate dev --name add_prompts_table`

## Security Features

### API Key Encryption

- **Algorithm**: AES-256-CBC encryption for all stored API keys
- **Key Derivation**: PBKDF2 with salt using `crypto.scryptSync`
- **User Isolation**: Unique constraint ensures one key per provider per user
- **Soft Delete**: `isActive` flag allows key deactivation without data loss

### Access Control

- All API key operations require authentication
- Users can only access their own keys
- Cascade delete removes user's keys when user is deleted

## Notes

- Neon requires `sslmode=require` in the URL.
- Prisma client is generated into `node_modules/@prisma/client` and imported as `@prisma/client`.
- Avoid committing `.env`. Ensure it's in `.gitignore`.
- API keys are never returned in plain text - only metadata is exposed via API.
