'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import ScenarioEditor from '@/components/ScenarioEditor';

export default function NewScenarioPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/scenarios/new');
    }
  }, [isPending, session, router]);

  if (!session) return null;

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
