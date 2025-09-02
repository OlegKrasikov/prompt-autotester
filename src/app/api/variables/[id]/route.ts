import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { UpdateVariableSchema } from '@/server/validation/schemas';
import { okJson, notFound, errorJson, serverError } from '@/server/http/responses';
import { variablesService } from '@/server/services/variablesService';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);

    const variable = await variablesService.get(ctx, params.id);

    if (!variable) {
      return notFound('Variable not found');
    }

    return okJson(serializeBigInt(variable));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error fetching variable:', error);
    return serverError('Failed to fetch variable');
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);

    const json = await request.json();
    const body = UpdateVariableSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid variable payload', { status: 400, details: body.error.flatten() });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(body.data.key)) {
      return errorJson('Key must contain only letters, numbers, and underscores', { status: 400 });
    }

    // Check if current variable exists and belongs to user
    const updated = await variablesService.update(ctx, params.id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Variable not found');
      if (updated.code === 'DUPLICATE')
        return errorJson('Variable with this key already exists', { status: 400 });
      return serverError('Failed to update variable');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error updating variable:', error);
    return serverError('Failed to update variable');
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);

    const removed = await variablesService.remove(ctx, params.id);
    if (removed.error) {
      if (removed.code === 'NOT_FOUND') return notFound('Variable not found');
      if (removed.code === 'IN_USE') {
        return errorJson('Cannot delete variable because it is being used', {
          status: 400,
          userMessage:
            'This variable is currently being used and cannot be deleted. Remove it from all prompts and scenarios first.',
          details: removed.details,
        });
      }
      return serverError('Failed to delete variable');
    }
    return okJson({ success: true });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    console.error('Error deleting variable:', error);
    return serverError('Failed to delete variable');
  }
}
