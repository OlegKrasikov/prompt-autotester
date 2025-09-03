import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { okJson, errorJson, unauthorized, serverError } from '@/server/http/responses';
import { requireOrgContext } from '@/server/auth/orgContext';
import { z } from 'zod';

const CreateOrgSchema = z.object({ name: z.string().min(2).max(100) });

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);
    // List organizations where user is a member
    const orgs = await prisma.organizationMember.findMany({
      where: { userId: ctx.userId, status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { updatedAt: 'desc' },
    });
    const data = orgs.map((m) => ({
      id: m.orgId,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
      isActive: ctx.activeOrgId === m.orgId,
    }));
    return okJson(data);
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    if ((e as Error).message === 'ORG_REQUIRED')
      return errorJson('Organization required', { status: 403 });
    return serverError('Failed to list orgs');
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);
    const json = await request.json();
    const body = CreateOrgSchema.safeParse(json);
    if (!body.success)
      return errorJson('Invalid payload', { status: 400, details: body.error.flatten() });

    // Create org + membership as ADMIN for creator
    const slugBase = body.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = await uniqueSlug(slugBase);
    const org = await prisma.organization.create({
      data: {
        name: body.data.name,
        slug,
        createdByUserId: ctx.userId,
        members: { create: { userId: ctx.userId, role: 'ADMIN', status: 'ACTIVE' } },
      },
    });
    return okJson({ id: org.id, name: org.name, slug: org.slug });
  } catch (e) {
    if ((e as Error).message === 'UNAUTHORIZED') return unauthorized();
    return serverError('Failed to create org');
  }
}

async function uniqueSlug(base: string): Promise<string> {
  let attempt = 0;
  while (true) {
    const slug = attempt === 0 ? base : `${base}-${attempt}`;
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt += 1;
  }
}
