import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { okJson, unauthorized, forbidden, serverError } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';
import { can } from '@/server/auth/rbac';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const ctx = await requireOrgContext(request);
    if (ctx.activeOrgId !== id) return forbidden('Switch to the org first');
    if (!can(ctx, 'manage', 'members')) return forbidden('Admins only');
    const invites = await prisma.organizationInvitation.findMany({
      where: { orgId: id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, expiresAt: true, status: true },
    });
    return okJson(invites);
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to fetch invitations');
  }
}
