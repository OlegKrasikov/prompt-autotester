import { variablesRepository } from '@/server/repos/variablesRepository';
import {
  VariableFiltersSchema,
  CreateVariableSchema,
  UpdateVariableSchema,
} from '@/server/validation/schemas';
import { VariableFilters, VariableListItem } from '@/lib/types';

export const variablesService = {
  async list(userId: string, filters: VariableFilters) {
    const parsed = VariableFiltersSchema.parse(filters);
    const vars = await variablesRepository.findManyByUser(userId, parsed);
    const list: VariableListItem[] = vars.map((v) => ({
      id: v.id,
      key: v.key,
      value: v.value,
      description: v.description ?? undefined,
      updatedAt: v.updatedAt,
    }));
    return list;
  },

  async get(userId: string, id: string) {
    return variablesRepository.findByIdForUser(id, userId);
  },

  async create(userId: string, body: unknown) {
    const parsed = CreateVariableSchema.parse(body);
    const dupe = await variablesRepository.findByKeyForUser(parsed.key, userId);
    if (dupe)
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Variable with this key already exists',
      };
    const created = await variablesRepository.create({
      user: { connect: { id: userId } },
      key: parsed.key,
      value: parsed.value,
      description: parsed.description,
    });
    return { error: false as const, data: created };
  },

  async update(userId: string, id: string, body: unknown) {
    const parsed = UpdateVariableSchema.parse(body);
    const existing = await variablesRepository.findByIdForUser(id, userId);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Variable not found' };
    if (parsed.key !== existing.key) {
      const dupe = await variablesRepository.findByKeyForUser(parsed.key, userId);
      if (dupe)
        return {
          error: true as const,
          code: 'DUPLICATE',
          message: 'Variable with this key already exists',
        };
    }
    const updated = await variablesRepository.update(id, {
      key: parsed.key,
      value: parsed.value,
      description: parsed.description,
    });
    return { error: false as const, data: updated };
  },

  async remove(userId: string, id: string) {
    const existing = await variablesRepository.findByIdForUser(id, userId);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Variable not found' };
    const usage = await variablesRepository.usage(existing.key, userId);
    if (usage.prompts.length > 0 || usage.scenarios.length > 0) {
      return {
        error: true as const,
        code: 'IN_USE',
        message: 'Variable is in use',
        details: usage,
      };
    }
    await variablesRepository.delete(id);
    return { error: false as const };
  },
};
