import { z } from "zod";
import {
  SCENARIO_STATUS,
  SCENARIO_TURN_TYPE,
  EXPECTATION_TYPE,
  PROMPT_STATUS,
  REASONING_EFFORT,
  VERBOSITY,
  SERVICE_TIER,
} from "@/lib/constants/enums";

// Shared enums
export const ScenarioStatusSchema = z.enum(SCENARIO_STATUS);
export const ScenarioTurnTypeSchema = z.enum(SCENARIO_TURN_TYPE);
export const ExpectationTypeSchema = z.enum(EXPECTATION_TYPE);
export const PromptStatusSchema = z.enum(PROMPT_STATUS);

// Prompts
export const PromptFiltersSchema = z.object({
  search: z.string().optional(),
  status: PromptStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const CreatePromptSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.string().min(1),
  status: PromptStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdatePromptSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  content: z.string().min(1),
  status: PromptStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
});

// Scenarios
export const ScenarioFiltersSchema = z.object({
  search: z.string().optional(),
  locale: z.string().optional(),
  status: ScenarioStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const ScenarioExpectationSchema = z.object({
  expectationKey: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
  expectationType: ExpectationTypeSchema,
  argsJson: z.record(z.unknown()).default({}),
  weight: z.number().int().optional(),
});

export const ScenarioTurnSchema = z.object({
  orderIndex: z.number().int().nonnegative().default(0),
  turnType: ScenarioTurnTypeSchema,
  userText: z.string().optional(),
  expectations: z.array(ScenarioExpectationSchema).optional(),
});

export const CreateScenarioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  locale: z.string().default("en"),
  status: ScenarioStatusSchema.optional(),
  tags: z.array(z.string()).optional(),
  turns: z.array(ScenarioTurnSchema).optional(),
});

export const UpdateScenarioSchema = CreateScenarioSchema;

// Variables
export const VariableFiltersSchema = z.object({
  search: z.string().optional(),
});

export const CreateVariableSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/),
  value: z.string().min(1),
  description: z.string().optional(),
});

export const UpdateVariableSchema = CreateVariableSchema;

// Simulation
export const ModelConfigSchema = z.object({
  model: z.string().min(1),
  reasoningEffort: z.enum(REASONING_EFFORT).optional(),
  verbosity: z.enum(VERBOSITY).optional(),
  serviceTier: z.enum(SERVICE_TIER).optional(),
});

export const SimulateRequestSchema = z.object({
  oldPrompt: z.string().min(1),
  newPrompt: z.string().min(1),
  scenarioKey: z.string().min(1),
  modelConfig: ModelConfigSchema.optional(),
  model: z.string().optional(), // legacy fallback
}).refine((data) => !!(data.modelConfig?.model || data.model), {
  message: "modelConfig.model or model is required",
  path: ["modelConfig"],
});

export type PromptFiltersInput = z.infer<typeof PromptFiltersSchema>;
export type CreatePromptInput = z.infer<typeof CreatePromptSchema>;
export type UpdatePromptInput = z.infer<typeof UpdatePromptSchema>;
export type ScenarioFiltersInput = z.infer<typeof ScenarioFiltersSchema>;
export type CreateScenarioInput = z.infer<typeof CreateScenarioSchema>;
export type UpdateScenarioInput = z.infer<typeof UpdateScenarioSchema>;
export type VariableFiltersInput = z.infer<typeof VariableFiltersSchema>;
export type CreateVariableInput = z.infer<typeof CreateVariableSchema>;
export type UpdateVariableInput = z.infer<typeof UpdateVariableSchema>;
export type SimulateRequestInput = z.infer<typeof SimulateRequestSchema>;
