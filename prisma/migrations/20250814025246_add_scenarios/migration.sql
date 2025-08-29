-- CreateEnum
CREATE TYPE "public"."scenario_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."scenario_turn_type" AS ENUM ('USER', 'EXPECT');

-- CreateEnum
CREATE TYPE "public"."expectation_type" AS ENUM ('MUST_CONTAIN', 'MUST_CONTAIN_ANY', 'MUST_NOT_CONTAIN', 'REGEX', 'SEMANTIC_ASSERT');

-- CreateTable
CREATE TABLE "public"."scenario" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "seed" INTEGER,
    "max_turns" INTEGER,
    "status" "public"."scenario_status" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scenario_turn" (
    "id" BIGSERIAL NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "turn_type" "public"."scenario_turn_type" NOT NULL,
    "user_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_turn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scenario_expectation" (
    "id" BIGSERIAL NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "turn_id" BIGINT NOT NULL,
    "expectation_key" TEXT NOT NULL,
    "expectation_type" "public"."expectation_type" NOT NULL,
    "args_json" JSONB NOT NULL DEFAULT '{}',
    "weight" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_expectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scenario_version" (
    "version_id" BIGSERIAL NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "scenario_version_pkey" PRIMARY KEY ("version_id")
);

-- CreateTable
CREATE TABLE "public"."scenario_suite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_suite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scenario_suite_item" (
    "suite_id" TEXT NOT NULL,
    "scenario_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "scenario_suite_item_pkey" PRIMARY KEY ("suite_id","scenario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scenario_turn_scenario_id_order_index_key" ON "public"."scenario_turn"("scenario_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_version_scenario_id_version_number_key" ON "public"."scenario_version"("scenario_id", "version_number");

-- AddForeignKey
ALTER TABLE "public"."scenario_turn" ADD CONSTRAINT "scenario_turn_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_expectation" ADD CONSTRAINT "scenario_expectation_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_expectation" ADD CONSTRAINT "scenario_expectation_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "public"."scenario_turn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_version" ADD CONSTRAINT "scenario_version_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_suite_item" ADD CONSTRAINT "scenario_suite_item_suite_id_fkey" FOREIGN KEY ("suite_id") REFERENCES "public"."scenario_suite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scenario_suite_item" ADD CONSTRAINT "scenario_suite_item_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
