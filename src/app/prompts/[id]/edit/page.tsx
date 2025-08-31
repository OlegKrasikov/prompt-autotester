'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { PromptFull } from '@/lib/types';
import PromptForm from '@/components/PromptForm';
import { Spinner } from '@/components/ui/Spinner';

interface EditPromptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPromptPage({ params }: EditPromptPageProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [prompt, setPrompt] = React.useState<PromptFull | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const resolvedParams = React.use(params);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/prompts/${resolvedParams.id}/edit`);
    }
  }, [isPending, session, router, resolvedParams.id]);

  React.useEffect(() => {
    if (session) {
      fetchPrompt();
    }
  }, [session, resolvedParams.id]);

  const fetchPrompt = async () => {
    try {
      const response = await fetch(`/api/prompts/${resolvedParams.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Prompt not found');
        } else {
          throw new Error('Failed to fetch prompt');
        }
        return;
      }
      const data = await response.json();
      setPrompt(data);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] p-6">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-[color:var(--color-muted-foreground)]">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-background)] p-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-[color:var(--color-foreground)]">
            {error || 'Prompt not found'}
          </h1>
          <p className="mb-6 text-[color:var(--color-muted-foreground)]">
            The prompt you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <button
            onClick={() => router.push('/prompts')}
            className="rounded-[var(--radius)] bg-[color:var(--color-accent)] px-4 py-2 text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
          >
            Back to Prompts
          </button>
        </div>
      </div>
    );
  }

  return (
    <PromptForm
      mode="edit"
      initialData={prompt}
      onSave={(updatedPrompt) => {
        router.push('/prompts');
      }}
      onCancel={() => router.push('/prompts')}
    />
  );
}
