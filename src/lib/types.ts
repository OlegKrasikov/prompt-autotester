export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface Conversation {
  title: string;
  messages: ChatMessage[];
}

export interface Scenario {
  key: string;
  name: string;
  description: string;
  seed: Conversation;
}

import type {
  ScenarioStatus,
  ScenarioTurnType,
  ExpectationType,
  PromptStatus,
  ReasoningEffort,
  Verbosity,
  ServiceTier,
} from '@/lib/constants/enums';

export interface ModelConfig {
  model: string;
  reasoningEffort?: ReasoningEffort;
  verbosity?: Verbosity;
  serviceTier?: ServiceTier;
}

export interface SimulateRequestBody {
  oldPrompt: string;
  newPrompt: string;
  scenarioKey: string;
  modelConfig?: ModelConfig;
  // Backward compatibility
  model?: string;
}

export interface SimulateResponseBody {
  old: Conversation;
  new: Conversation;
}

export type { ScenarioStatus, ScenarioTurnType, ExpectationType };

export interface ScenarioExpectation {
  id?: bigint;
  expectationKey: string;
  expectationType: ExpectationType;
  argsJson: Record<string, unknown>;
  weight?: number;
}

export interface ScenarioTurn {
  id?: bigint;
  orderIndex: number;
  turnType: ScenarioTurnType;
  userText?: string;
  expectations?: ScenarioExpectation[];
}

export interface ScenarioFull {
  id: string;
  userId: string;
  name: string;
  description?: string;
  locale: string;
  seed?: number;
  maxTurns?: number;
  status: ScenarioStatus;
  version: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  turns: ScenarioTurn[];
}

export interface ScenarioListItem {
  id: string;
  name: string;
  description?: string;
  locale: string;
  tags: string[];
  status: ScenarioStatus;
  version: number;
  userTurns: number;
  expectTurns: number;
  totalTurns: number;
  updatedAt: Date;
}

export interface ScenarioFilters {
  search?: string;
  locale?: string;
  tags?: string[];
  status?: ScenarioStatus;
}

export interface CreateScenarioRequest {
  name: string;
  description?: string;
  locale?: string;
  status?: ScenarioStatus;
  tags?: string[];
  turns?: Omit<ScenarioTurn, 'id'>[];
}

export type UpdateScenarioRequest = CreateScenarioRequest;

export type { PromptStatus };

export interface PromptFull {
  id: string;
  userId: string;
  name: string;
  description?: string;
  content: string;
  status: PromptStatus;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptListItem {
  id: string;
  name: string;
  description?: string;
  content: string;
  status: PromptStatus;
  tags: string[];
  updatedAt: Date;
}

export interface PromptFilters {
  search?: string;
  status?: PromptStatus;
  tags?: string[];
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
  content: string;
  status?: PromptStatus;
  tags?: string[];
}

export type UpdatePromptRequest = CreatePromptRequest;

export interface VariableFull {
  id: string;
  userId: string;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariableListItem {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}

export interface VariableFilters {
  search?: string;
}

export interface CreateVariableRequest {
  key: string;
  value: string;
  description?: string;
}

export type UpdateVariableRequest = CreateVariableRequest;
