import { NextRequest } from 'next/server';
import { PromptStatus } from '@/lib/types';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, serverError, errorJson } from '@/server/http/responses';
import { PromptFiltersSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { promptsService } from '@/server/services/promptsService';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const { searchParams } = new URL(request.url);
    const filters = PromptFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as PromptStatus) || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    });

    const promptList = await promptsService.list(ctx, filters);
    return okJson(promptList);
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error fetching prompts', { error: String(error) });
    return serverError('Failed to fetch prompts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const json = await request.json();
    const created = await promptsService.create(ctx, json);
    if (created.error) {
      return errorJson(created.message, { status: created.code === 'DUPLICATE' ? 400 : 404 });
    }
    return okJson(created.data);
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error creating prompt', { error: String(error) });
    return serverError('Failed to create prompt');
  }
}
