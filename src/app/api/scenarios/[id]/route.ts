import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, notFound, serverError, errorJson, forbidden } from '@/server/http/responses';
import { UpdateScenarioSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { scenariosService } from '@/server/services/scenariosService';
import { can } from '@/server/auth/rbac';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);

    const { id } = params;
    const scenario = await scenariosService.getFull(ctx, id);

    if (!scenario) {
      return notFound('Scenario not found');
    }

    return okJson(serializeBigInt(scenario));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error fetching scenario', { error: String(error) });
    return serverError('Failed to fetch scenario');
  }
}

export async function PUT(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);
    if (!can(ctx as any, 'write', 'scenarios')) return forbidden('Insufficient role');

    const { id } = params;
    const raw = await request.json();
    const body = UpdateScenarioSchema.safeParse(raw);
    if (!body.success) {
      return errorJson('Invalid scenario payload', { status: 400, details: body.error.flatten() });
    }
    const updated = await scenariosService.update(ctx, id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Scenario not found');
      return serverError('Failed to update scenario');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error updating scenario', { error: String(error) });
    return serverError('Failed to update scenario');
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);
    if (!can(ctx as any, 'write', 'scenarios')) return forbidden('Insufficient role');

    const { id } = params;
    const removed = await scenariosService.remove(ctx, id);
    if (removed.error) return notFound('Scenario not found');
    return okJson({ success: true });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return errorJson('Organization required', { status: 403 });
    }
    getLogger(request).error('Error deleting scenario', { error: String(error) });
    return serverError('Failed to delete scenario');
  }
}
