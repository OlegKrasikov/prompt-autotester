# Settings

Manage user configuration, primarily encrypted API keys for AI providers.

## Route

- Page: `/settings` (auth required)
- API: `/api/user/api-keys`, `/api/user/api-keys/validate`

## API Key Management (OpenAI)

- Add key: validates format (`sk-...`) and via `/validate` before save
- Encryption: AES-256-CBC via `src/server/utils/crypto.ts`; per-user isolation
- Reactivation: soft-deleted keys can be reactivated
- Remove: soft delete via `DELETE /api/user/api-keys?provider=openai`

## API Endpoints

- `GET /api/user/api-keys` → `{ apiKeys: ApiKey[] }` (metadata only)
- `POST /api/user/api-keys` → upsert `{ provider, keyName?, apiKey }`
- `POST /api/user/api-keys/validate` → `{ valid, userMessage, testResponse? }`
- `DELETE /api/user/api-keys?provider=<provider>` → deactivate key

## Model

```prisma
model UserApiKey {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  provider     String
  keyName      String   @map("key_name")
  encryptedKey String   @map("encrypted_key")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  @@unique([userId, provider], name: "idx_user_provider_unique")
  @@map("user_api_key")
}
```

## Security

- Keys encrypted at rest; never returned in plain text
- All endpoints require authentication; user-scoped access only
- `ENCRYPTION_KEY` required in environment

### Generate ENCRYPTION_KEY

Use a high‑entropy secret (≥32 random bytes). We derive the encryption key via scrypt.

Quick commands

- `openssl rand -hex 32`
- `openssl rand -base64 32`
- `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `python - <<'PY'\nimport secrets; print(secrets.token_hex(32))\nPY`
