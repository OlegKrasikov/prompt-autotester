import { variablesRepository } from '@/server/repos/variablesRepository';
import {
  VariableFiltersSchema,
  CreateVariableSchema,
  UpdateVariableSchema,
} from '@/server/validation/schemas';
import { VariableFilters, VariableListItem } from '@/lib/types';
import type { OrgContext } from '@/server/auth/orgContext';

export const variablesService = {
  async list(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, filters: VariableFilters) {
    const parsed = VariableFiltersSchema.parse(filters);
    const vars = await variablesRepository.findManyByUser(ctx.userId, parsed, ctx.activeOrgId);
    const list: VariableListItem[] = vars.map((v) => ({
      id: v.id,
      key: v.key,
      value: v.value,
      description: v.description ?? undefined,
      updatedAt: v.updatedAt,
    }));
    return list;
  },

  async get(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    return variablesRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
  },

  async create(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, body: unknown) {
    const parsed = CreateVariableSchema.parse(body);
    const dupe = await variablesRepository.findByKeyForUser(
      parsed.key,
      ctx.userId,
      ctx.activeOrgId,
    );
    if (dupe)
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Variable with this key already exists',
      };
    const created = await variablesRepository.create({
      user: { connect: { id: ctx.userId } },
      organization: { connect: { id: ctx.activeOrgId as string } },
      key: parsed.key,
      value: parsed.value,
      description: parsed.description,
    });
    return { error: false as const, data: created };
  },

  async update(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string, body: unknown) {
    const parsed = UpdateVariableSchema.parse(body);
    const existing = await variablesRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Variable not found' };
    if (parsed.key !== existing.key) {
      const dupe = await variablesRepository.findByKeyForUser(
        parsed.key,
        ctx.userId,
        ctx.activeOrgId,
      );
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

  async remove(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    const existing = await variablesRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Variable not found' };
    const usage = await variablesRepository.usage(existing.key, ctx.userId, ctx.activeOrgId);
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
