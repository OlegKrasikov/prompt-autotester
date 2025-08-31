import { prisma } from '@/lib/prisma';
import {
  ScenarioFiltersSchema,
  CreateScenarioSchema,
  UpdateScenarioSchema,
} from '@/server/validation/schemas';
import { ScenarioFilters, ScenarioListItem, ScenarioStatus } from '@/lib/types';
import { Prisma } from '@prisma/client';

export const scenariosService = {
  async list(userId: string, filters: ScenarioFilters) {
    const parsed = ScenarioFiltersSchema.parse(filters);
    const where: any = { userId };
    if (parsed.search) {
      where.OR = [
        { name: { contains: parsed.search, mode: 'insensitive' } },
        { id: { contains: parsed.search, mode: 'insensitive' } },
        { tags: { hasSome: [parsed.search] } },
      ];
    }
    if (parsed.locale) where.locale = parsed.locale;
    if (parsed.status) where.status = parsed.status as ScenarioStatus;
    if (parsed.tags?.length) where.tags = { hasSome: parsed.tags };

    const scenarios = await prisma.scenario.findMany({
      where,
      include: { _count: { select: { turns: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const list: ScenarioListItem[] = scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      locale: s.locale,
      tags: s.tags,
      status: s.status as ScenarioStatus,
      version: s.version,
      userTurns: 0,
      expectTurns: 0,
      totalTurns: (s as any)._count?.turns ?? 0,
      updatedAt: s.updatedAt,
    }));
    return list;
  },

  async listPublished(userId: string) {
    const scenarios = await prisma.scenario.findMany({
      where: { userId, status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        locale: true,
        tags: true,
        status: true,
        version: true,
        updatedAt: true,
      },
    });
    const list: ScenarioListItem[] = scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      locale: s.locale,
      tags: s.tags,
      status: s.status as ScenarioStatus,
      version: s.version,
      userTurns: 0,
      expectTurns: 0,
      totalTurns: 0,
      updatedAt: s.updatedAt,
    }));
    return list;
  },

  async getFull(userId: string, id: string) {
    return prisma.scenario.findFirst({
      where: { id, userId },
      include: {
        turns: {
          include: { expectations: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  },

  async create(userId: string, body: unknown) {
    const parsed = CreateScenarioSchema.parse(body);
    const dupe = await prisma.scenario.findFirst({ where: { name: parsed.name, userId } });
    if (dupe)
      return {
        error: true as const,
        code: 'DUPLICATE',
        message: 'Scenario with this name already exists',
      };

    const created = await prisma.$transaction(async (tx) => {
      const scenario = await tx.scenario.create({
        data: {
          userId,
          name: parsed.name,
          description: parsed.description,
          locale: parsed.locale || 'en',
          status: parsed.status || 'DRAFT',
          tags: parsed.tags || [],
        },
      });

      if (parsed.turns?.length) {
        for (const turn of parsed.turns) {
          const createdTurn = await tx.scenarioTurn.create({
            data: {
              scenarioId: scenario.id,
              orderIndex: turn.orderIndex ?? 0,
              turnType: turn.turnType,
              userText: turn.userText,
            },
          });
          if (turn.expectations?.length) {
            await tx.scenarioExpectation.createMany({
              data: turn.expectations.map((exp) => ({
                scenarioId: scenario.id,
                turnId: createdTurn.id,
                expectationKey: exp.expectationKey,
                expectationType: exp.expectationType,
                argsJson: exp.argsJson as Prisma.JsonObject,
                weight: exp.weight,
              })),
            });
          }
        }
      }

      return scenario;
    });

    const full = await this.getFull(userId, created.id);
    return { error: false as const, data: full };
  },

  async update(userId: string, id: string, body: unknown) {
    const parsed = UpdateScenarioSchema.parse(body);
    const existing = await prisma.scenario.findFirst({ where: { id, userId } });
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    await prisma.$transaction(async (tx) => {
      await tx.scenarioTurn.deleteMany({ where: { scenarioId: id } });
      await tx.scenario.update({
        where: { id },
        data: {
          name: parsed.name,
          description: parsed.description,
          locale: parsed.locale || 'en',
          status: parsed.status,
          tags: parsed.tags || [],
          version: { increment: 1 },
        },
      });
      if (parsed.turns?.length) {
        for (const turn of parsed.turns) {
          const createdTurn = await tx.scenarioTurn.create({
            data: {
              scenarioId: id,
              orderIndex: turn.orderIndex ?? 0,
              turnType: turn.turnType,
              userText: turn.userText,
            },
          });
          if (turn.expectations?.length) {
            await tx.scenarioExpectation.createMany({
              data: turn.expectations.map((exp) => ({
                scenarioId: id,
                turnId: createdTurn.id,
                expectationKey: exp.expectationKey,
                expectationType: exp.expectationType,
                argsJson: exp.argsJson as Prisma.JsonObject,
                weight: exp.weight,
              })),
            });
          }
        }
      }
    });

    const full = await this.getFull(userId, id);
    return { error: false as const, data: full };
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.scenario.findFirst({ where: { id, userId } });
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };
    await prisma.scenario.delete({ where: { id } });
    return { error: false as const };
  },

  async duplicate(userId: string, id: string) {
    const existing = await prisma.scenario.findFirst({
      where: { id, userId },
      include: {
        turns: { include: { expectations: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!existing)
      return { error: true as const, code: 'NOT_FOUND', message: 'Scenario not found' };

    let name = `${existing.name} (Copy)`;
    let counter = 1;
    while (await prisma.scenario.findFirst({ where: { userId, name } })) {
      counter++;
      name = `${existing.name} (Copy ${counter})`;
    }

    const created = await prisma.$transaction(async (tx) => {
      const scenario = await tx.scenario.create({
        data: {
          userId,
          name,
          description: existing.description,
          locale: existing.locale,
          status: 'DRAFT',
          tags: existing.tags,
        },
      });
      for (const turn of existing.turns) {
        const createdTurn = await tx.scenarioTurn.create({
          data: {
            scenarioId: scenario.id,
            orderIndex: turn.orderIndex,
            turnType: turn.turnType,
            userText: turn.userText,
          },
        });
        if (turn.expectations.length) {
          await tx.scenarioExpectation.createMany({
            data: turn.expectations.map((exp) => ({
              scenarioId: scenario.id,
              turnId: createdTurn.id,
              expectationKey: exp.expectationKey,
              expectationType: exp.expectationType,
              argsJson: exp.argsJson as Prisma.JsonObject,
              weight: exp.weight,
            })),
          });
        }
      }
      return scenario;
    });

    const full = await this.getFull(userId, created.id);
    return { error: false as const, data: full };
  },
};
