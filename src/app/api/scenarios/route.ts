import { NextRequest } from 'next/server';
import { ScenarioListItem, ScenarioStatus } from '@/lib/types';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, serverError, errorJson } from '@/server/http/responses';
import { CreateScenarioSchema, ScenarioFiltersSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { scenariosService } from '@/server/services/scenariosService';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const { searchParams } = new URL(request.url);
    const filters = ScenarioFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      locale: searchParams.get('locale') || undefined,
      status: (searchParams.get('status') as ScenarioStatus) || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    });

    const scenarioList: ScenarioListItem[] = await scenariosService.list(ctx, filters);
    return okJson(serializeBigInt(scenarioList));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error fetching scenarios', { error: String(error) });
    return serverError('Failed to fetch scenarios');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const json = await request.json();
    const body = CreateScenarioSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid scenario payload', { status: 400, details: body.error.flatten() });
    }

    const created = await scenariosService.create(ctx, body.data);
    if (created.error) return errorJson(created.message, { status: 400 });
    return okJson(serializeBigInt(created.data));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error creating scenario', { error: String(error) });
    return serverError('Failed to create scenario');
  }
}
