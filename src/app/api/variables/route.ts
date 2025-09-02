import { NextRequest } from 'next/server';
import { VariableListItem } from '@/lib/types';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, errorJson, serverError } from '@/server/http/responses';
import { CreateVariableSchema, VariableFiltersSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { variablesService } from '@/server/services/variablesService';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const { searchParams } = new URL(request.url);
    const filters = VariableFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
    });

    const whereClause: Record<string, unknown> = {};

    if (filters.search) {
      whereClause.OR = [
        { key: { contains: filters.search, mode: 'insensitive' } },
        { value: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const variableList: VariableListItem[] = await variablesService.list(ctx, filters);
    return okJson(variableList);
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error fetching variables', { error: String(error) });
    return serverError('Failed to fetch variables');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const json = await request.json();
    const body = CreateVariableSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid variable payload', { status: 400, details: body.error.flatten() });
    }

    // Check if variable with same key exists for this user
    const created = await variablesService.create(ctx, body.data);
    if (created.error) return errorJson(created.message, { status: 400 });
    return okJson(created.data);
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error creating variable', { error: String(error) });
    return serverError('Failed to create variable');
  }
}
