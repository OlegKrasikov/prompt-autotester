import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { VariableFilters } from '@/lib/types';

export const variablesRepository = {
  async findManyByUser(userId: string, filters: VariableFilters = {}, orgId?: string | null) {
    const where: Prisma.VariableWhereInput = (orgId ? { orgId } : { userId }) as any;
    if (filters.search) {
      (where as any).OR = [
        { key: { contains: filters.search, mode: 'insensitive' } },
        { value: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return prisma.variable.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  },
  async findByIdForUser(id: string, userId: string, orgId?: string | null) {
    return prisma.variable.findFirst({ where: orgId ? { id, orgId } : { id, userId } });
  },
  async findByKeyForUser(key: string, userId: string, orgId?: string | null) {
    return prisma.variable.findFirst({ where: orgId ? { key, orgId } : { key, userId } });
  },
  async create(data: Prisma.VariableCreateInput) {
    return prisma.variable.create({ data });
  },
  async update(id: string, data: Prisma.VariableUpdateInput) {
    return prisma.variable.update({ where: { id }, data });
  },
  async delete(id: string) {
    return prisma.variable.delete({ where: { id } });
  },
  async usage(variableKey: string, userId: string, orgId?: string | null) {
    const variablePattern = `{{${variableKey}}}`;
    const prompts = await prisma.prompt.findMany({
      where: orgId
        ? { orgId, content: { contains: variablePattern } }
        : { userId, content: { contains: variablePattern } },
      select: { id: true, name: true },
    });
    const turns = await prisma.scenarioTurn.findMany({
      where: orgId
        ? { scenario: { orgId }, userText: { contains: variablePattern } }
        : { scenario: { userId }, userText: { contains: variablePattern } },
      include: { scenario: { select: { id: true, name: true } } },
    });
    const scenarios = turns
      .map((t) => t.scenario)
      .filter((s, i, arr) => i === arr.findIndex((x) => x.id === s.id));
    return { prompts, scenarios };
  },
};
