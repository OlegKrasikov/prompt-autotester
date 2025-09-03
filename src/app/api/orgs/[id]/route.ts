import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { okJson, unauthorized, forbidden, serverError, errorJson } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';

const RenameSchema = z.object({ name: z.string().min(2).max(100) });

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const ctx = await requireOrgContext(request);
    // Verify requester is ADMIN of the target org (not necessarily active)
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: ctx.userId } },
      select: { role: true, status: true },
    });
    if (!membership || membership.status !== 'ACTIVE' || membership.role !== 'ADMIN')
      return forbidden('Admins only');

    const json = await request.json();
    const body = RenameSchema.safeParse(json);
    if (!body.success)
      return errorJson('Invalid payload', { status: 400, details: body.error.flatten() });

    const updated = await prisma.organization.update({
      where: { id },
      data: { name: body.data.name },
      select: { id: true, name: true, slug: true },
    });
    return okJson(updated);
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to rename organization');
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const ctx = await requireOrgContext(request);
    // Verify requester is ADMIN of the target org (not necessarily active)
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: id, userId: ctx.userId } },
      select: { role: true, status: true },
    });
    if (!membership || membership.status !== 'ACTIVE' || membership.role !== 'ADMIN')
      return forbidden('Admins only');

    // Find a candidate org to switch users to (for client convenience)
    const otherMembership = await prisma.organizationMember.findFirst({
      where: { userId: ctx.userId, orgId: { not: id }, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { orgId: true },
    });

    await prisma.$transaction([
      // Clear lastActiveOrgId for all users pointing to this org to avoid FK violation
      prisma.userProfile.updateMany({
        where: { lastActiveOrgId: id },
        data: { lastActiveOrgId: null },
      }),
      // Delete org (cascades to members, resources via FKs)
      prisma.organization.delete({ where: { id } }) as any,
    ]);

    return okJson({ ok: true, nextOrgId: otherMembership?.orgId ?? null });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to delete organization');
  }
}
