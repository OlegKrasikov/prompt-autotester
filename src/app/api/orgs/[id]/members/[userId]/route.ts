import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { okJson, unauthorized, forbidden, errorJson, serverError } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';
import { auth } from '@/lib/auth';
import { setOrgCookies } from '@/server/auth/orgClaims';
import { can } from '@/server/auth/rbac';
import { z } from 'zod';

const UpdateRoleSchema = z.object({ role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']) });

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const { id, userId } = await context.params;
    const ctx = await requireOrgContext(request);
    if (ctx.activeOrgId !== id) return forbidden('Switch to the org first');
    if (!can(ctx, 'manage', 'members')) return forbidden('Admins only');
    const json = await request.json();
    const body = UpdateRoleSchema.safeParse(json);
    if (!body.success)
      return errorJson('Invalid payload', { status: 400, details: body.error.flatten() });

    // Prevent demoting the last admin
    if (body.data.role !== 'ADMIN') {
      const adminCount = await prisma.organizationMember.count({
        where: { orgId: id, role: 'ADMIN', status: 'ACTIVE' },
      });
      const isTargetAdmin = await prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId: id, userId } },
      });
      if (isTargetAdmin?.role === 'ADMIN' && adminCount <= 1) {
        return errorJson('Cannot remove the last Admin', { status: 400 });
      }
    }

    const updated = await prisma.organizationMember.update({
      where: { orgId_userId: { orgId: id, userId } },
      data: { role: body.data.role },
    });
    // If current user changed their own role, refresh cookies
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id === userId) {
      const json = NextResponse.json({ userId: updated.userId, role: updated.role });
      return setOrgCookies(json, id, updated.role);
    }
    return okJson({ userId: updated.userId, role: updated.role });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to update role');
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> },
) {
  try {
    const { id, userId } = await context.params;
    const ctx = await requireOrgContext(request);
    if (ctx.activeOrgId !== id) return forbidden('Switch to the org first');
    if (!can(ctx, 'manage', 'members')) return forbidden('Admins only');

    // Prevent removing last admin
    const target = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: id, userId } },
    });
    if (target?.role === 'ADMIN') {
      const adminCount = await prisma.organizationMember.count({
        where: { orgId: id, role: 'ADMIN', status: 'ACTIVE' },
      });
      if (adminCount <= 1) return errorJson('Cannot remove the last Admin', { status: 400 });
    }

    await prisma.organizationMember.update({
      where: { orgId_userId: { orgId: id, userId } },
      data: { status: 'REMOVED' },
    });
    return okJson({ ok: true });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to remove member');
  }
}
