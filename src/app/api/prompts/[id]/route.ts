import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { UpdatePromptSchema } from '@/server/validation/schemas';
import { okJson, notFound, errorJson, serverError, forbidden } from '@/server/http/responses';
import { promptsService } from '@/server/services/promptsService';
import { can } from '@/server/auth/rbac';

export async function GET(request: NextRequest, { params }: any) {
  const resolvedParams = params;
  try {
    const ctx = await requireOrgContext(request);

    const prompt = await promptsService.get(ctx, resolvedParams.id);

    if (!prompt) {
      return notFound('Prompt not found');
    }

    return okJson(serializeBigInt(prompt));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error fetching prompt:', error);
    return serverError('Failed to fetch prompt');
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  const resolvedParams = params;
  try {
    const ctx = await requireOrgContext(request);
    if (!can(ctx as any, 'write', 'prompts')) return forbidden('Insufficient role');

    const json = await request.json();
    const body = UpdatePromptSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid prompt payload', { status: 400, details: body.error.flatten() });
    }

    // Check if prompt exists and belongs to user
    const updated = await promptsService.update(ctx, resolvedParams.id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Prompt not found');
      if (updated.code === 'DUPLICATE')
        return errorJson('Prompt with this name already exists', { status: 400 });
      return serverError('Failed to update prompt');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error updating prompt:', error);
    return serverError('Failed to update prompt');
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  const resolvedParams = params;
  try {
    const ctx = await requireOrgContext(request);
    if (!can(ctx as any, 'write', 'prompts')) return forbidden('Insufficient role');

    const removed = await promptsService.remove(ctx, resolvedParams.id);
    if (removed.error) return notFound('Prompt not found');
    return okJson({ success: true });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error deleting prompt:', error);
    return serverError('Failed to delete prompt');
  }
}
