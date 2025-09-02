import { NextRequest, NextResponse } from 'next/server';
import { ScenarioListItem } from '@/lib/types';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { scenariosService } from '@/server/services/scenariosService';

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);

    const result: ScenarioListItem[] = await scenariosService.listPublished(ctx);

    const response = NextResponse.json(serializeBigInt(result), {
      status: 200,
    });

    // Short-lived private cache to smooth repeated loads within a session
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Error fetching published scenarios:', error);
    return NextResponse.json({ error: 'Failed to fetch published scenarios' }, { status: 500 });
  }
}
