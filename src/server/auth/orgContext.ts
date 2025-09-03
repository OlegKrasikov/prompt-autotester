import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type OrgRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export type OrgContext = {
  userId: string;
  activeOrgId: string;
  role: OrgRole;
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
};

/**
 * Resolve session and active organization. In shadow mode, lazily creates a Personal org
 * for the user if none exists. Stores last active org in UserProfile.
 */
export async function resolveOrgContext(request: NextRequest): Promise<OrgContext | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) return null;
  const userId = session.user.id as string;
  const userEmail = (session.user.email as string | undefined) ?? undefined;

  // Load or create UserProfile (best-effort; tolerate missing table during migration)
  let profile: { lastActiveOrgId: string | null } | null = null;
  try {
    const p = await prisma.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    profile = { lastActiveOrgId: (p as any).lastActiveOrgId ?? null };
  } catch {
    // If user_profile table doesn't exist yet, continue without profile
    profile = null;
  }

  // Auto-accept pending invitations for this user's email (no email/token flow)
  if (userEmail) {
    const pendingInvites = await prisma.organizationInvitation.findMany({
      where: {
        email: { equals: userEmail, mode: 'insensitive' },
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    for (const inv of pendingInvites) {
      const existing = await prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId: inv.orgId, userId } },
      });
      if (!existing) {
        await prisma.organizationMember.create({
          data: { orgId: inv.orgId, userId, role: inv.role, status: 'ACTIVE' },
        });
      } else if (existing.status !== 'ACTIVE') {
        await prisma.organizationMember.update({
          where: { orgId_userId: { orgId: inv.orgId, userId } },
          data: { status: 'ACTIVE', role: inv.role },
        });
      }
      await prisma.organizationInvitation.update({
        where: { id: inv.id },
        data: { status: 'ACCEPTED', acceptedByUserId: userId },
      });
    }
  }

  // If no memberships exist, and shadow mode is on, create a personal org.
  const memberships = await prisma.organizationMember.findMany({
    where: { userId, status: 'ACTIVE' },
  });
  let activeOrgId = profile?.lastActiveOrgId || null;

  if (memberships.length === 0) {
    const personalName = `${session.user.name ?? session.user.email ?? 'Personal'}'s Workspace`;
    const slugBase = (session.user.name ?? session.user.email ?? 'personal')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = await uniqueSlug(slugBase);

    const org = await prisma.organization.create({
      data: {
        name: personalName,
        slug,
        createdByUserId: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
    });
    activeOrgId = org.id;
    try {
      await prisma.userProfile.update({
        where: { userId },
        data: { lastActiveOrgId: activeOrgId },
      });
    } catch {}
  }

  // Pick an active org if not set
  if (!activeOrgId) {
    const first = memberships[0];
    if (first) {
      activeOrgId = first.orgId;
      try {
        await prisma.userProfile.update({
          where: { userId },
          data: { lastActiveOrgId: activeOrgId },
        });
      } catch {}
    }
  }

  if (!activeOrgId) {
    throw new Error('ORG_REQUIRED');
  }
  const m = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId: activeOrgId, userId } },
  });
  const role = (m?.role as OrgRole) ?? 'VIEWER';

  // Note: integrating org claims into Better Auth tokens can be added via auth hooks if available.
  return {
    userId,
    activeOrgId,
    role,
    isAdmin: role === 'ADMIN',
    isEditor: role === 'ADMIN' || role === 'EDITOR',
    isViewer: role === 'ADMIN' || role === 'EDITOR' || role === 'VIEWER',
  };
}

export async function requireOrgContext(request: NextRequest): Promise<OrgContext> {
  const ctx = await resolveOrgContext(request);
  if (!ctx) throw new Error('UNAUTHORIZED');
  return ctx;
}

export async function switchActiveOrg(userId: string, orgId: string) {
  // Verify membership
  const member = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!member || member.status !== 'ACTIVE') throw new Error('FORBIDDEN');
  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, lastActiveOrgId: orgId },
    update: { lastActiveOrgId: orgId },
  });
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
