import { NextRequest, NextResponse } from 'next/server';
import { ScenarioListItem, ScenarioStatus } from '@/lib/types';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { scenariosService } from '@/server/services/scenariosService';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result: ScenarioListItem[] = await scenariosService.listPublished(user.id);

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
