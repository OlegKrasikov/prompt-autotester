import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, notFound, serverError, forbidden } from '@/server/http/responses';
import { scenariosService } from '@/server/services/scenariosService';
import { can } from '@/server/auth/rbac';

export async function POST(request: NextRequest, { params }: any) {
  try {
    const ctx = await requireOrgContext(request);
    if (!can(ctx as any, 'write', 'scenarios')) return forbidden('Insufficient role');

    const { id } = params;
    const dup = await scenariosService.duplicate(ctx, id);
    if (dup.error) return notFound('Scenario not found');
    return okJson(serializeBigInt(dup.data));
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return serverError('Organization required', { code: 'ORG_REQUIRED' } as any);
    }
    console.error('Error duplicating scenario:', error);
    return serverError('Failed to duplicate scenario');
  }
}
