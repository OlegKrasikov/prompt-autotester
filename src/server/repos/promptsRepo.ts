import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const promptsRepo = {
  async findManyByUser(userId: string, where: Prisma.PromptWhereInput = {}) {
    return prisma.prompt.findMany({
      where: { userId, ...where },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async findByIdForUser(id: string, userId: string) {
    return prisma.prompt.findFirst({ where: { id, userId } });
  },

  async findByNameForUser(name: string, userId: string) {
    return prisma.prompt.findFirst({ where: { name, userId } });
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
