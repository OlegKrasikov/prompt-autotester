import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { okJson, unauthorized, forbidden, serverError, notFound } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';
import { can } from '@/server/auth/rbac';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; invitationId: string }> },
) {
  try {
    const { id, invitationId } = await context.params;
    const ctx = await requireOrgContext(request);
    if (ctx.activeOrgId !== id) return forbidden('Switch to the org first');
    if (!can(ctx, 'manage', 'members')) return forbidden('Admins only');
    const invite = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
    });
    if (!invite || invite.orgId !== id) return notFound('Invite not found');
    // No email send; update timestamp for audit/resend state
    await prisma.organizationInvitation.update({
      where: { id: invitationId },
      data: { updatedAt: new Date() },
    });
    return okJson({ ok: true });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to resend invite');
  }
}
