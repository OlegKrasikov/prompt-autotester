-- Ensure org_id is non-null and org-scoped uniqueness is enforced

-- Scenarios
ALTER TABLE "scenario" ALTER COLUMN "org_id" SET NOT NULL;
DO $$ BEGIN
  DROP INDEX IF EXISTS "idx_scenario_user_name_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_scenario_org_name_unique" ON "scenario" ("org_id", "name");

-- Scenario Suite
ALTER TABLE "scenario_suite" ALTER COLUMN "org_id" SET NOT NULL;

-- Prompts
ALTER TABLE "prompt" ALTER COLUMN "org_id" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_prompt_org_name_unique" ON "prompt" ("org_id", "name");

-- Variables
ALTER TABLE "variable" ALTER COLUMN "org_id" SET NOT NULL;
DO $$ BEGIN
  DROP INDEX IF EXISTS "idx_user_variable_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_variable_unique" ON "variable" ("org_id", "key");

-- User API Keys
ALTER TABLE "user_api_key" ALTER COLUMN "org_id" SET NOT NULL;
DO $$ BEGIN
  DROP INDEX IF EXISTS "idx_user_provider_unique";
EXCEPTION WHEN undefined_object THEN NULL; END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_org_provider_unique" ON "user_api_key" ("org_id", "provider");

