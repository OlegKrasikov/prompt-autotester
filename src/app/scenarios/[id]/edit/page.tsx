'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { ScenarioFull } from '@/lib/types';
import ScenarioEditor from '@/components/ScenarioEditor';

export default function EditScenarioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [orgRole, setOrgRole] = React.useState<'ADMIN' | 'EDITOR' | 'VIEWER' | null>(null);
  const [scenario, setScenario] = React.useState<ScenarioFull | null>(null);
  const [loading, setLoading] = React.useState(true);
  const resolvedParams = React.use(params);
  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/scenarios/${resolvedParams.id}/edit`);
    }
  }, [isPending, session, router, resolvedParams.id]);

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
    if (session) {
      const fetchScenario = async () => {
        try {
          const response = await fetch(`/api/scenarios/${resolvedParams.id}`);
          if (response.ok) {
            const data = await response.json();
            setScenario(data);
          } else if (response.status === 404) {
            router.push('/scenarios');
          }
        } catch (error) {
          console.error('Failed to fetch scenario:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchScenario();
    }
  }, [session, resolvedParams.id, router]);

  if (!session || loading) return <div className="p-8">Loading...</div>;
  if (orgRole === 'VIEWER') return null;
  if (!scenario) return <div className="p-8">Scenario not found</div>;

  return (
    <ScenarioEditor
      mode="edit"
      initialData={scenario}
      onSave={() => {
        router.push('/scenarios');
      }}
      onCancel={() => router.push('/scenarios')}
    />
  );
}
