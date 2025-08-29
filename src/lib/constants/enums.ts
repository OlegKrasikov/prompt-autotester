export const SCENARIO_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ScenarioStatus = typeof SCENARIO_STATUS[number];

export const SCENARIO_TURN_TYPE = ["USER", "EXPECT"] as const;
export type ScenarioTurnType = typeof SCENARIO_TURN_TYPE[number];

export const EXPECTATION_TYPE = [
  "MUST_CONTAIN",
  "MUST_CONTAIN_ANY",
  "MUST_NOT_CONTAIN",
  "REGEX",
  "SEMANTIC_ASSERT",
] as const;
export type ExpectationType = typeof EXPECTATION_TYPE[number];

export const PROMPT_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type PromptStatus = typeof PROMPT_STATUS[number];

export const REASONING_EFFORT = ["minimal", "medium", "high"] as const;
export type ReasoningEffort = typeof REASONING_EFFORT[number];

export const VERBOSITY = ["low", "medium", "high"] as const;
export type Verbosity = typeof VERBOSITY[number];

export const SERVICE_TIER = ["default", "priority"] as const;
export type ServiceTier = typeof SERVICE_TIER[number];

