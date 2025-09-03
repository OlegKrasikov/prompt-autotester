import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';
import AccessDenied from './AccessDenied';

export default async function SettingsPage() {
  // Determine active org + role on the server (tolerate missing user_profile table)
  const cookieStore = await cookies();
  const headerMap = new Headers();
  cookieStore.getAll().forEach((c) => headerMap.append('cookie', `${c.name}=${c.value}`));
  const session = await auth.api.getSession({ headers: headerMap });
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id as string;
  let activeOrgId: string | null = null;
  try {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    activeOrgId = profile?.lastActiveOrgId ?? null;
  } catch {
    activeOrgId = null;
  }
  if (!activeOrgId) {
    const mem = await prisma.organizationMember.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
      select: { orgId: true, role: true },
    });
    activeOrgId = mem?.orgId ?? null;
    if (!activeOrgId) redirect('/');
  }
  const member = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId: activeOrgId, userId } },
    select: { role: true },
  });
  const orgRole = (member?.role as 'ADMIN' | 'EDITOR' | 'VIEWER') ?? 'VIEWER';
  // Only admins can access settings. Others see a proper empty state.
  if (orgRole !== 'ADMIN') {
    return <AccessDenied />;
  }
  return <SettingsClient orgRole={orgRole} />;
}
