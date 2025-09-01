import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  CreateScenarioRequest,
  ScenarioFilters,
  UpdateScenarioRequest,
  ScenarioListItem,
  ScenarioFull,
} from '@/lib/types';
import type { ScenarioStatus, ScenarioTurnType, ExpectationType } from '@/lib/constants/enums';

// Helper to coerce plain objects into Prisma JSON input types
const toJson = (obj: unknown): Prisma.InputJsonValue => obj as Prisma.InputJsonValue;

export const scenariosRepository = {
  async findManyByUser(userId: string, filters: ScenarioFilters = {}): Promise<ScenarioListItem[]> {
    const where: any = { userId };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { id: { contains: filters.search, mode: 'insensitive' } },
        { tags: { hasSome: [filters.search] } },
      ];
    }
    if (filters.locale) where.locale = filters.locale;
    if (filters.status) where.status = filters.status;
    if (filters.tags?.length) where.tags = { hasSome: filters.tags };

    const scenarios = await prisma.scenario.findMany({
      where,
      include: { _count: { select: { turns: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return scenarios.map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? undefined,
      locale: s.locale,
      tags: s.tags,
      status: s.status as ScenarioStatus,
      version: s.version,
      userTurns: 0,
      expectTurns: 0,
      totalTurns: s._count?.turns ?? 0,
      updatedAt: s.updatedAt,
    }));
  },

  async findPublishedByUser(userId: string): Promise<ScenarioListItem[]> {
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
    return scenarios.map((s) => ({
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
  },

  async getFullForUser(userId: string, id: string): Promise<ScenarioFull | null> {
    const s = await prisma.scenario.findFirst({
      where: { id, userId },
      include: {
        turns: {
          include: { expectations: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
    if (!s) return null;
    return {
      id: s.id,
      userId: s.userId,
      name: s.name,
      description: s.description ?? undefined,
      locale: s.locale,
      seed: s.seed ?? undefined,
      maxTurns: s.maxTurns ?? undefined,
      status: s.status as ScenarioStatus,
      version: s.version,
      tags: s.tags,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      turns: s.turns.map((t) => ({
        id: t.id,
        orderIndex: t.orderIndex,
        turnType: t.turnType as ScenarioTurnType,
        userText: t.userText ?? undefined,
        expectations: t.expectations.map((e) => ({
          id: e.id,
          expectationKey: e.expectationKey,
          expectationType: e.expectationType as ExpectationType,
          argsJson: (e.argsJson as any) ?? {},
          weight: e.weight ?? undefined,
        })),
      })),
    };
  },

  async findByNameForUser(name: string, userId: string) {
    return prisma.scenario.findFirst({ where: { name, userId } });
  },

  async createWithTurns(userId: string, dto: CreateScenarioRequest) {
    return prisma.$transaction(async (tx) => {
      const scenario = await tx.scenario.create({
        data: {
          userId,
          name: dto.name,
          description: dto.description,
          locale: dto.locale || 'en',
          status: dto.status || 'DRAFT',
          tags: dto.tags || [],
        },
      });

      if (dto.turns?.length) {
        for (const turn of dto.turns) {
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
                argsJson: toJson(exp.argsJson ?? {}),
                weight: exp.weight,
              })),
            });
          }
        }
      }

      return scenario;
    });
  },

  async replaceWithTurns(userId: string, id: string, dto: UpdateScenarioRequest) {
    return prisma.$transaction(async (tx) => {
      // Ensure the scenario belongs to the user
      const existing = await tx.scenario.findFirst({ where: { id, userId } });
      if (!existing) return null;

      await tx.scenarioTurn.deleteMany({ where: { scenarioId: id } });
      await tx.scenario.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          locale: dto.locale || 'en',
          status: dto.status,
          tags: dto.tags || [],
          version: { increment: 1 },
        },
      });

      if (dto.turns?.length) {
        for (const turn of dto.turns) {
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
                argsJson: toJson(exp.argsJson ?? {}),
                weight: exp.weight,
              })),
            });
          }
        }
      }

      return true;
    });
  },

  async deleteForUser(userId: string, id: string) {
    const existing = await prisma.scenario.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.scenario.delete({ where: { id } });
    return true;
  },

  async duplicate(userId: string, id: string) {
    const existing = await prisma.scenario.findFirst({
      where: { id, userId },
      include: {
        turns: { include: { expectations: true }, orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!existing) return null;

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
          description: existing.description ?? undefined,
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
            userText: turn.userText ?? undefined,
          },
        });
        if (turn.expectations.length) {
          await tx.scenarioExpectation.createMany({
            data: turn.expectations.map((exp) => ({
              scenarioId: scenario.id,
              turnId: createdTurn.id,
              expectationKey: exp.expectationKey,
              expectationType: exp.expectationType,
              argsJson: toJson(exp.argsJson ?? {}),
              weight: exp.weight ?? undefined,
            })),
          });
        }
      }
      return scenario;
    });

    return created;
  },
};
