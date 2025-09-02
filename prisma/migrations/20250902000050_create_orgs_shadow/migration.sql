-- Create organization-related tables and add nullable org_id columns to existing tables

-- Create enums used by organization tables (idempotent)
DO $$ BEGIN CREATE TYPE "org_role" AS ENUM ('ADMIN','EDITOR','VIEWER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "member_status" AS ENUM ('ACTIVE','INVITED','REMOVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "invite_status" AS ENUM ('PENDING','ACCEPTED','EXPIRED','REVOKED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Organizations
CREATE TABLE IF NOT EXISTS "organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "created_by_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "organization"
  ADD CONSTRAINT "fk_org_creator_user" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE CASCADE;

-- Organization members
CREATE TABLE IF NOT EXISTS "organization_member" (
  "org_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "role" "org_role" NOT NULL DEFAULT 'VIEWER',
  "status" "member_status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("org_id", "user_id")
);
ALTER TABLE "organization_member"
  ADD CONSTRAINT "fk_member_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE;
ALTER TABLE "organization_member"
  ADD CONSTRAINT "fk_member_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_member_user_role_status" ON "organization_member" ("user_id", "role", "status");

-- Organization invitations
CREATE TABLE IF NOT EXISTS "organization_invitation" (
  "id" TEXT PRIMARY KEY,
  "org_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "org_role" NOT NULL DEFAULT 'VIEWER',
  "token" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP NOT NULL,
  "invited_by_user_id" TEXT NOT NULL,
  "accepted_by_user_id" TEXT NULL,
  "status" "invite_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "organization_invitation"
  ADD CONSTRAINT "fk_invite_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE;
ALTER TABLE "organization_invitation"
  ADD CONSTRAINT "fk_invite_invited_by" FOREIGN KEY ("invited_by_user_id") REFERENCES "user"("id") ON DELETE NO ACTION;
ALTER TABLE "organization_invitation"
  ADD CONSTRAINT "fk_invite_accepted_by" FOREIGN KEY ("accepted_by_user_id") REFERENCES "user"("id") ON DELETE NO ACTION;
CREATE INDEX IF NOT EXISTS "idx_invite_org_email_status" ON "organization_invitation" ("org_id", "email", "status");

-- User profile
CREATE TABLE IF NOT EXISTS "user_profile" (
  "user_id" TEXT PRIMARY KEY,
  "last_active_org_id" TEXT NULL
);
ALTER TABLE "user_profile"
  ADD CONSTRAINT "fk_profile_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "user_profile"
  ADD CONSTRAINT "fk_profile_last_org" FOREIGN KEY ("last_active_org_id") REFERENCES "organization"("id") ON DELETE NO ACTION;

-- Add nullable org_id to existing tables if not present
DO $$ BEGIN
  ALTER TABLE "scenario" ADD COLUMN "org_id" TEXT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "scenario_suite" ADD COLUMN "org_id" TEXT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "prompt" ADD COLUMN "org_id" TEXT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "variable" ADD COLUMN "org_id" TEXT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "user_api_key" ADD COLUMN "org_id" TEXT NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add foreign keys for org_id columns
DO $$ BEGIN ALTER TABLE "scenario" ADD CONSTRAINT "fk_scenario_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "scenario_suite" ADD CONSTRAINT "fk_suite_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "prompt" ADD CONSTRAINT "fk_prompt_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "variable" ADD CONSTRAINT "fk_variable_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "user_api_key" ADD CONSTRAINT "fk_userapikey_org" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes for org_id columns
CREATE INDEX IF NOT EXISTS "idx_scenario_org_status_updated" ON "scenario" ("org_id", "status", "updated_at");
CREATE INDEX IF NOT EXISTS "idx_prompt_org_status_updated" ON "prompt" ("org_id", "status", "updated_at");
CREATE INDEX IF NOT EXISTS "idx_variable_org_updated" ON "variable" ("org_id", "updated_at");

-- If tables were created earlier with TEXT columns, alter them to enum types (idempotent best-effort)
DO $$ BEGIN
  ALTER TABLE "organization_member" ALTER COLUMN "role" TYPE "org_role" USING "role"::text::"org_role";
EXCEPTION WHEN undefined_table THEN NULL WHEN undefined_object THEN NULL END $$;
DO $$ BEGIN
  ALTER TABLE "organization_member" ALTER COLUMN "status" TYPE "member_status" USING "status"::text::"member_status";
EXCEPTION WHEN undefined_table THEN NULL WHEN undefined_object THEN NULL END $$;
DO $$ BEGIN
  ALTER TABLE "organization_invitation" ALTER COLUMN "role" TYPE "org_role" USING "role"::text::"org_role";
EXCEPTION WHEN undefined_table THEN NULL WHEN undefined_object THEN NULL END $$;
DO $$ BEGIN
  ALTER TABLE "organization_invitation" ALTER COLUMN "status" TYPE "invite_status" USING "status"::text::"invite_status";
EXCEPTION WHEN undefined_table THEN NULL WHEN undefined_object THEN NULL END $$;
