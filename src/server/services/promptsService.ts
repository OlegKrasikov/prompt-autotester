import { promptsRepo } from "@/server/repos/promptsRepo";
import { PromptFiltersSchema, CreatePromptSchema, UpdatePromptSchema } from "@/server/validation/schemas";
import { PromptFilters, PromptListItem, PromptStatus } from "@/lib/types";

export const promptsService = {
  async list(userId: string, filters: PromptFilters) {
    const parsed = PromptFiltersSchema.parse(filters);
    const where: any = {};

    if (parsed.search) {
      where.OR = [
        { name: { contains: parsed.search, mode: "insensitive" } },
        { description: { contains: parsed.search, mode: "insensitive" } },
        { content: { contains: parsed.search, mode: "insensitive" } },
        { tags: { hasSome: [parsed.search] } },
      ];
    }
    if (parsed.status) where.status = parsed.status as PromptStatus;
    if (parsed.tags?.length) where.tags = { hasSome: parsed.tags };

    const prompts = await promptsRepo.findManyByUser(userId, where);
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

  async get(userId: string, id: string) {
    return promptsRepo.findByIdForUser(id, userId);
  },

  async create(userId: string, body: unknown) {
    const parsed = CreatePromptSchema.parse(body);

    const dupe = await promptsRepo.findByNameForUser(parsed.name, userId);
    if (dupe) {
      return { error: true as const, code: "DUPLICATE", message: "Prompt with this name already exists" };
    }

    const created = await promptsRepo.create({
      user: { connect: { id: userId } },
      name: parsed.name,
      description: parsed.description,
      content: parsed.content,
      status: parsed.status || "DRAFT",
      tags: parsed.tags || [],
    });
    return { error: false as const, data: created };
  },

  async update(userId: string, id: string, body: unknown) {
    const parsed = UpdatePromptSchema.parse(body);
    const existing = await promptsRepo.findByIdForUser(id, userId);
    if (!existing) return { error: true as const, code: "NOT_FOUND", message: "Prompt not found" };

    const dupe = await promptsRepo.findByNameForUser(parsed.name, userId);
    if (dupe && dupe.id !== id) {
      return { error: true as const, code: "DUPLICATE", message: "Prompt with this name already exists" };
    }

    const updated = await promptsRepo.update(id, {
      name: parsed.name,
      description: parsed.description,
      content: parsed.content,
      status: parsed.status || existing.status,
      tags: parsed.tags || [],
    });
    return { error: false as const, data: updated };
  },

  async remove(userId: string, id: string) {
    const existing = await promptsRepo.findByIdForUser(id, userId);
    if (!existing) return { error: true as const, code: "NOT_FOUND", message: "Prompt not found" };
    await promptsRepo.delete(id);
    return { error: false as const };
  },
};

