import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { Prisma } from '@prisma/client';
import { okJson, unauthorized, notFound, serverError, errorJson } from '@/server/http/responses';
import { UpdateScenarioSchema } from '@/server/validation/schemas';
import { getLogger } from '@/server/logging/logger';
import { scenariosService } from '@/server/services/scenariosService';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = params;
    const scenario = await scenariosService.getFull(user.id, id);

    if (!scenario) {
      return notFound('Scenario not found');
    }

    return okJson(serializeBigInt(scenario));
  } catch (error) {
    getLogger(request).error('Error fetching scenario', { error: String(error) });
    return serverError('Failed to fetch scenario');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = params;
    const raw = await request.json();
    const body = UpdateScenarioSchema.safeParse(raw);
    if (!body.success) {
      return errorJson('Invalid scenario payload', { status: 400, details: body.error.flatten() });
    }
    const updated = await scenariosService.update(user.id, id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Scenario not found');
      return serverError('Failed to update scenario');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    getLogger(request).error('Error updating scenario', { error: String(error) });
    return serverError('Failed to update scenario');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = params;
    const removed = await scenariosService.remove(user.id, id);
    if (removed.error) return notFound('Scenario not found');
    return okJson({ success: true });
  } catch (error) {
    getLogger(request).error('Error deleting scenario', { error: String(error) });
    return serverError('Failed to delete scenario');
  }
}
