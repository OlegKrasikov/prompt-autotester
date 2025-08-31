import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { okJson, unauthorized, notFound, serverError } from '@/server/http/responses';
import { scenariosService } from '@/server/services/scenariosService';

export async function POST(request: NextRequest, { params }: any) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const { id } = params;
    const dup = await scenariosService.duplicate(user.id, id);
    if (dup.error) return notFound('Scenario not found');
    return okJson(serializeBigInt(dup.data));
  } catch (error) {
    console.error('Error duplicating scenario:', error);
    return serverError('Failed to duplicate scenario');
  }
}
