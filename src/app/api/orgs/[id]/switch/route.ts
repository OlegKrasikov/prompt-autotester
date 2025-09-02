import { NextRequest, NextResponse } from 'next/server';
import { unauthorized, forbidden, serverError } from '@/server/http/responses';
import { auth } from '@/lib/auth';
import { switchActiveOrg } from '@/server/auth/orgContext';
import { prisma } from '@/lib/prisma';
import { setOrgCookies } from '@/server/auth/orgClaims';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id as string;
    await switchActiveOrg(userId, id);
    // Fetch role to set cookie claims
    const member = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: id, userId } },
    });
    const json = NextResponse.json({
      ok: true,
      active_org_id: id,
      org_role: member?.role ?? 'VIEWER',
    });
    return setOrgCookies(json, id, member?.role ?? 'VIEWER');
  } catch (e) {
    if ((e as Error).message === 'FORBIDDEN') return forbidden('Not a member of this org');
    return serverError('Failed to switch organization');
  }
}
