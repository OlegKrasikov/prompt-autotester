import { NextRequest } from 'next/server';
import { PromptStatus } from '@/lib/types';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { okJson, unauthorized, serverError, errorJson } from '@/server/http/responses';
import { PromptFiltersSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { promptsService } from '@/server/services/promptsService';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const filters = PromptFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as PromptStatus) || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    });

    const promptList = await promptsService.list(user.id, filters);
    return okJson(promptList);
  } catch (error) {
    getLogger(request).error('Error fetching prompts', { error: String(error) });
    return serverError('Failed to fetch prompts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const json = await request.json();
    const created = await promptsService.create(user.id, json);
    if (created.error) {
      return errorJson(created.message, { status: created.code === 'DUPLICATE' ? 400 : 404 });
    }
    return okJson(created.data);
  } catch (error) {
    getLogger(request).error('Error creating prompt', { error: String(error) });
    return serverError('Failed to create prompt');
  }
}
