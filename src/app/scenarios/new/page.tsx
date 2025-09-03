'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import ScenarioEditor from '@/components/ScenarioEditor';

export default function NewScenarioPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [orgRole, setOrgRole] = React.useState<'ADMIN' | 'EDITOR' | 'VIEWER' | null>(null);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/scenarios/new');
    }
  }, [isPending, session, router]);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/orgs');
        if (res.ok) {
          const data: Array<{
            id: string;
            role: 'ADMIN' | 'EDITOR' | 'VIEWER';
            isActive: boolean;
          }> = await res.json();
          const active = data.find((o) => o.isActive) || data[0];
          if (active) setOrgRole(active.role);
          return;
        }
      } catch {}
      const cookie = document.cookie.split('; ').find((c) => c.startsWith('pa_org_role='));
      if (cookie) {
        const role = decodeURIComponent(cookie.split('=')[1]) as any;
        if (role === 'ADMIN' || role === 'EDITOR' || role === 'VIEWER') setOrgRole(role);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (orgRole === 'VIEWER') router.replace('/scenarios');
  }, [orgRole, router]);

  if (!session || orgRole === 'VIEWER') return null;

  return (
    <ScenarioEditor
      mode="create"
      onSave={() => {
        router.push('/scenarios');
      }}
      onCancel={() => router.push('/scenarios')}
    />
  );
}
