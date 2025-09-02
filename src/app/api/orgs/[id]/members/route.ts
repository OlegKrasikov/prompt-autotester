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
    if (ctx.activeOrgId !== id) {
      // allow listing only active org members for now
      return forbidden('Switch to the org first');
    }
    if (!can(ctx, 'read', 'members')) return forbidden('Insufficient role');
    const members = await prisma.organizationMember.findMany({
      where: { orgId: id, status: 'ACTIVE' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
    return okJson(
      members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        status: m.status,
      })),
    );
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to fetch members');
  }
}
