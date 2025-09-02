import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { okJson, unauthorized, forbidden, errorJson, serverError } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';
import { can } from '@/server/auth/rbac';
import { Flags } from '@/lib/featureFlags';
import { z } from 'zod';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER'),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!Flags.invites()) return forbidden('Invites disabled');
    const ctx = await requireOrgContext(request);
    if (ctx.activeOrgId !== id) return forbidden('Switch to the org first');
    if (!can(ctx, 'manage', 'members')) return forbidden('Admins only');

    const json = await request.json();
    const body = InviteSchema.safeParse(json);
    if (!body.success)
      return errorJson('Invalid invite payload', { status: 400, details: body.error.flatten() });
    const email = body.data.email.toLowerCase();

    // If email already a member: idempotent success
    const existingUser = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (existingUser) {
      const existingMember = await prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId: id, userId: existingUser.id } },
      });
      if (existingMember && existingMember.status === 'ACTIVE') {
        return okJson({ status: 'already_member' });
      }
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const invite = await prisma.organizationInvitation.create({
      data: {
        orgId: id,
        email,
        role: body.data.role,
        token,
        expiresAt,
        invitedByUserId: ctx.userId,
        status: 'PENDING',
      },
    });

    // TODO: send email via provider; for now return token for testing
    return okJson({ id: invite.id, token: invite.token, expiresAt: invite.expiresAt });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to create invitation');
  }
}
