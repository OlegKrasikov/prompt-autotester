import { scenariosRepository } from '@/server/repos/scenariosRepository';
import {
  ScenarioFiltersSchema,
  CreateScenarioSchema,
  UpdateScenarioSchema,
} from '@/server/validation/schemas';
import { ScenarioFilters } from '@/lib/types';
import type { OrgContext } from '@/server/auth/orgContext';

export const scenariosService = {
  async list(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, filters: ScenarioFilters) {
    const parsed = ScenarioFiltersSchema.parse(filters);
    return scenariosRepository.findManyByUser(ctx.userId, parsed, ctx.activeOrgId);
  },

  async listPublished(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>) {
    return scenariosRepository.findPublishedByUser(ctx.userId, ctx.activeOrgId);
  },

  async getFull(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    return scenariosRepository.getFullForUser(ctx.userId, id, ctx.activeOrgId);
  },

  async create(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, body: unknown) {
    const parsed = CreateScenarioSchema.parse(body);
    const dupe = await scenariosRepository.findByNameForUser(
      parsed.name,
      ctx.userId,
      ctx.activeOrgId,
    );
    if (dupe)
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Scenario with this name already exists',
      };
    try {
      const created = await scenariosRepository.createWithTurns(
        ctx.userId,
        parsed,
        ctx.activeOrgId,
      );
      const full = await scenariosRepository.getFullForUser(
        ctx.userId,
        created.id,
        ctx.activeOrgId,
      );
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

  async update(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string, body: unknown) {
    const parsed = UpdateScenarioSchema.parse(body);
    const existing = await scenariosRepository.getFullForUser(ctx.userId, id, ctx.activeOrgId);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    const replaced = await scenariosRepository.replaceWithTurns(
      ctx.userId,
      id,
      parsed,
      ctx.activeOrgId,
    );
    if (!replaced)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    const full = await scenariosRepository.getFullForUser(ctx.userId, id, ctx.activeOrgId);
    return { error: false as const, data: full };
  },

  async remove(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    const ok = await scenariosRepository.deleteForUser(ctx.userId, id, ctx.activeOrgId);
    if (!ok) return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };
    return { error: false as const };
  },

  async duplicate(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    try {
      const created = await scenariosRepository.duplicate(ctx.userId, id, ctx.activeOrgId);
      if (!created)
        return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };
      const full = await scenariosRepository.getFullForUser(
        ctx.userId,
        created.id,
        ctx.activeOrgId,
      );
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
