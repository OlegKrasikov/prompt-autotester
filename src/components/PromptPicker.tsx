'use client';

import React from 'react';
import { PromptListItem } from '@/lib/types';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { useRouter } from 'next/navigation';

interface PromptPickerProps {
  value: string; // prompt ID
  onChange: (promptId: string, promptContent: string) => void;
  error?: string;
}

export function PromptPicker({ value, onChange, error }: PromptPickerProps) {
  const router = useRouter();
  const [prompts, setPrompts] = React.useState<PromptListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/prompts?status=PUBLISHED');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPromptId = e.target.value;
    const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
    onChange(selectedPromptId, selectedPrompt?.content || '');
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase">
          Select Published Prompt
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/prompts')}
          className="text-xs"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
          </svg>
          Manage Prompts
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
          <Spinner size="sm" />
          <span className="text-sm text-[color:var(--color-muted-foreground)]">
            Loading prompts...
          </span>
        </div>
      ) : (
        <>
          <Select
            value={value}
            onChange={handlePromptChange}
            className={error ? 'border-[color:var(--color-danger)]' : ''}
            label=""
          >
            <option value="">Choose a prompt...</option>
            {prompts.length === 0 ? (
              <option value="" disabled>
                No published prompts available
              </option>
            ) : (
              prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name} {prompt.description ? `- ${prompt.description}` : ''}
                </option>
              ))
            )}
          </Select>

          {prompts.length === 0 && !loading && (
            <div className="rounded-[var(--radius)] border border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/10 p-3 text-sm text-[color:var(--color-warning)]">
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <div className="font-medium">No published prompts available</div>
                  <div className="mt-1 text-xs">
                    Create and publish prompts to use them for testing.
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-1 text-xs text-[color:var(--color-danger)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
