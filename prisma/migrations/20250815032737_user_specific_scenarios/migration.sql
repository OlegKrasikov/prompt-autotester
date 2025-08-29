/*
  Warnings:

  - Added the required column `user_id` to the `scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `scenario_suite` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add user_id column as nullable first
ALTER TABLE "public"."scenario" ADD COLUMN "user_id" TEXT;
ALTER TABLE "public"."scenario_suite" ADD COLUMN "user_id" TEXT;

-- Step 2: Assign existing scenarios to the first user (or create a default user if none exists)
DO $$
DECLARE
    first_user_id TEXT;
BEGIN
    -- Get the first user ID, or create a default user if no users exist
    SELECT id INTO first_user_id FROM "public"."user" LIMIT 1;
    
    IF first_user_id IS NULL THEN
        -- Create a default user if no users exist
        INSERT INTO "public"."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, 'System User', 'system@example.com', true, NOW(), NOW())
        RETURNING id INTO first_user_id;
    END IF;
    
    -- Assign all existing scenarios to this user
    UPDATE "public"."scenario" SET "user_id" = first_user_id WHERE "user_id" IS NULL;
    
    -- Assign all existing scenario suites to this user (if any exist)
    UPDATE "public"."scenario_suite" SET "user_id" = first_user_id WHERE "user_id" IS NULL;
END $$;

-- Step 3: Make user_id NOT NULL
ALTER TABLE "public"."scenario" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "public"."scenario_suite" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."scenario" ADD CONSTRAINT "scenario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_suite" ADD CONSTRAINT "scenario_suite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
