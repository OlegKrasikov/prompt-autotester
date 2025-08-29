import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const variablesRepo = {
  async findManyByUser(userId: string, where: Prisma.VariableWhereInput = {}) {
    return prisma.variable.findMany({ where: { userId, ...where }, orderBy: { updatedAt: "desc" } });
  },
  async findByIdForUser(id: string, userId: string) {
    return prisma.variable.findFirst({ where: { id, userId } });
  },
  async findByKeyForUser(key: string, userId: string) {
    return prisma.variable.findFirst({ where: { key, userId } });
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
  async usage(variableKey: string, userId: string) {
    const variablePattern = `{{${variableKey}}}`;
    const prompts = await prisma.prompt.findMany({
      where: { userId, content: { contains: variablePattern } },
      select: { id: true, name: true },
    });
    const turns = await prisma.scenarioTurn.findMany({
      where: { scenario: { userId }, userText: { contains: variablePattern } },
      include: { scenario: { select: { id: true, name: true } } },
    });
    const scenarios = turns
      .map((t) => t.scenario)
      .filter((s, i, arr) => i === arr.findIndex((x) => x.id === s.id));
    return { prompts, scenarios };
  },
};

