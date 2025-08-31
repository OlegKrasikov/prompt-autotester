'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import PromptForm from '@/components/PromptForm';

export default function NewPromptPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/prompts/new');
    }
  }, [isPending, session, router]);

  if (!session) return null;

  return (
    <PromptForm
      mode="create"
      onSave={(prompt) => {
        router.push('/prompts');
      }}
      onCancel={() => router.push('/prompts')}
    />
  );
}
