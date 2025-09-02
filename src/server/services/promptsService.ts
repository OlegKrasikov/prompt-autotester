import { promptsRepository } from '@/server/repos/promptsRepository';
import {
  PromptFiltersSchema,
  CreatePromptSchema,
  UpdatePromptSchema,
} from '@/server/validation/schemas';
import { PromptFilters, PromptListItem, PromptStatus } from '@/lib/types';
import type { OrgContext } from '@/server/auth/orgContext';

export const promptsService = {
  async list(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, filters: PromptFilters) {
    const parsed = PromptFiltersSchema.parse(filters);
    const prompts = await promptsRepository.findManyByUser(ctx.userId, parsed, ctx.activeOrgId);
    const result: PromptListItem[] = prompts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? undefined,
      content: p.content,
      status: p.status as PromptStatus,
      tags: p.tags,
      updatedAt: p.updatedAt,
    }));
    return result;
  },

  async get(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    return promptsRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
  },

  async create(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, body: unknown) {
    const parsed = CreatePromptSchema.parse(body);

    const dupe = await promptsRepository.findByNameForUser(
      parsed.name,
      ctx.userId,
      ctx.activeOrgId,
    );
    if (dupe) {
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Prompt with this name already exists',
      };
    }

    const created = await promptsRepository.create({
      user: { connect: { id: ctx.userId } },
      organization: { connect: { id: ctx.activeOrgId as string } },
      name: parsed.name,
      description: parsed.description,
      content: parsed.content,
      status: parsed.status || 'DRAFT',
      tags: parsed.tags || [],
    });
    return { error: false as const, data: created };
  },

  async update(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string, body: unknown) {
    const parsed = UpdatePromptSchema.parse(body);
    const existing = await promptsRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
    if (!existing) return { error: true as const, code: 'NOT_FOUND', message: 'Prompt not found' };

    const dupe = await promptsRepository.findByNameForUser(
      parsed.name,
      ctx.userId,
      ctx.activeOrgId,
    );
    if (dupe && dupe.id !== id) {
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Prompt with this name already exists',
      };
    }

    const updated = await promptsRepository.update(id, {
      name: parsed.name,
      description: parsed.description,
      content: parsed.content,
      status: parsed.status || existing.status,
      tags: parsed.tags || [],
    });
    return { error: false as const, data: updated };
  },

  async remove(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, id: string) {
    const existing = await promptsRepository.findByIdForUser(id, ctx.userId, ctx.activeOrgId);
    if (!existing) return { error: true as const, code: 'NOT_FOUND', message: 'Prompt not found' };
    await promptsRepository.delete(id);
    return { error: false as const };
  },
};
