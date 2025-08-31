import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { UpdatePromptSchema } from '@/server/validation/schemas';
import { okJson, unauthorized, notFound, errorJson, serverError } from '@/server/http/responses';
import { promptsService } from '@/server/services/promptsService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = params;
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const prompt = await promptsService.get(user.id, resolvedParams.id);

    if (!prompt) {
      return notFound('Prompt not found');
    }

    return okJson(serializeBigInt(prompt));
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return serverError('Failed to fetch prompt');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = params;
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const json = await request.json();
    const body = UpdatePromptSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid prompt payload', { status: 400, details: body.error.flatten() });
    }

    // Check if prompt exists and belongs to user
    const updated = await promptsService.update(user.id, resolvedParams.id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Prompt not found');
      if (updated.code === 'DUPLICATE')
        return errorJson('Prompt with this name already exists', { status: 400 });
      return serverError('Failed to update prompt');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    console.error('Error updating prompt:', error);
    return serverError('Failed to update prompt');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const resolvedParams = params;
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const removed = await promptsService.remove(user.id, resolvedParams.id);
    if (removed.error) return notFound('Prompt not found');
    return okJson({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return serverError('Failed to delete prompt');
  }
}
