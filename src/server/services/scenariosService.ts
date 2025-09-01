import { scenariosRepository } from '@/server/repos/scenariosRepository';
import {
  ScenarioFiltersSchema,
  CreateScenarioSchema,
  UpdateScenarioSchema,
} from '@/server/validation/schemas';
import { ScenarioFilters } from '@/lib/types';

export const scenariosService = {
  async list(userId: string, filters: ScenarioFilters) {
    const parsed = ScenarioFiltersSchema.parse(filters);
    return scenariosRepository.findManyByUser(userId, parsed);
  },

  async listPublished(userId: string) {
    return scenariosRepository.findPublishedByUser(userId);
  },

  async getFull(userId: string, id: string) {
    return scenariosRepository.getFullForUser(userId, id);
  },

  async create(userId: string, body: unknown) {
    const parsed = CreateScenarioSchema.parse(body);
    const dupe = await scenariosRepository.findByNameForUser(parsed.name, userId);
    if (dupe)
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Scenario with this name already exists',
      };
    try {
      const created = await scenariosRepository.createWithTurns(userId, parsed);
      const full = await scenariosRepository.getFullForUser(userId, created.id);
      return { error: false as const, data: full };
    } catch (err: any) {
      if (err && typeof err === 'object' && (err as any).code === 'P2002') {
        return {
          error: true as const,
          code: 'DUPLICATE',
          message: 'Scenario with this name already exists',
        };
      }
      throw err;
    }
  },

  async update(userId: string, id: string, body: unknown) {
    const parsed = UpdateScenarioSchema.parse(body);
    const existing = await scenariosRepository.getFullForUser(userId, id);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    const replaced = await scenariosRepository.replaceWithTurns(userId, id, parsed);
    if (!replaced)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    const full = await scenariosRepository.getFullForUser(userId, id);
    return { error: false as const, data: full };
  },

  async remove(userId: string, id: string) {
    const ok = await scenariosRepository.deleteForUser(userId, id);
    if (!ok) return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };
    return { error: false as const };
  },

  async duplicate(userId: string, id: string) {
    try {
      const created = await scenariosRepository.duplicate(userId, id);
      if (!created)
        return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };
      const full = await scenariosRepository.getFullForUser(userId, created.id);
      return { error: false as const, data: full };
    } catch (err: any) {
      if (err && typeof err === 'object' && (err as any).code === 'P2002') {
        return {
          error: true as const,
          code: 'DUPLICATE',
          message: 'A scenario with the generated name already exists',
        };
      }
      throw err;
    }
  },
};
