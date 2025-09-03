import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { PromptFilters } from '@/lib/types';

export const promptsRepository = {
  async findManyByUser(userId: string, filters: PromptFilters = {}, orgId?: string | null) {
    const where: Prisma.PromptWhereInput = (orgId ? { orgId } : { userId }) as any;
    if (filters.search) {
      (where as any).OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }
    if (filters.status) (where as any).status = filters.status as any;
    if (filters.tags?.length) (where as any).tags = { hasSome: filters.tags };

    return prisma.prompt.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findByIdForUser(id: string, userId: string, orgId?: string | null) {
    return prisma.prompt.findFirst({ where: orgId ? { id, orgId } : { id, userId } });
  },

  async findByNameForUser(name: string, userId: string, orgId?: string | null) {
    return prisma.prompt.findFirst({ where: orgId ? { name, orgId } : { name, userId } });
  },

  async create(data: Prisma.PromptCreateInput) {
    return prisma.prompt.create({ data });
  },

  async update(id: string, data: Prisma.PromptUpdateInput) {
    return prisma.prompt.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.prompt.delete({ where: { id } });
  },
};
