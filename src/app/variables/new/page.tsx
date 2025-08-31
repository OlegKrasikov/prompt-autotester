'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { CreateVariableRequest } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function NewVariablePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [formData, setFormData] = React.useState<CreateVariableRequest>({
    key: '',
    value: '',
    description: '',
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/variables/new');
    }
  }, [isPending, session, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only letters, numbers, and underscores';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/variables');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.userMessage ||
              errorData.error?.message ||
              'Failed to create variable';
        setErrors({ submit: msg });
      }
    } catch (error) {
      console.error('Error creating variable:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/variables');
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 flex items-center gap-3 text-2xl font-bold text-[color:var(--color-foreground)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[color:var(--color-accent)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
              </svg>
            </div>
            Create New Variable
          </h1>
          <p className="text-[color:var(--color-muted-foreground)]">
            Define a reusable key-value pair for prompt templates
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Variable Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      label="Key"
                      value={formData.key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g., company_name, user_role, product_type"
                      error={errors.key}
                      required
                    />

                    <Input
                      label="Description"
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Optional description of this variable"
                      error={errors.description}
                    />

                    <Textarea
                      label="Value"
                      value={formData.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder="Enter value..."
                      rows={6}
                      error={errors.value}
                      required
                    />

                    {errors.submit && (
                      <div className="rounded-[var(--radius)] border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 p-3 text-sm text-[color:var(--color-danger)]">
                        {errors.submit}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usage Guide */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-sm">Usage Guide</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="mb-1 font-medium text-[color:var(--color-foreground)]">
                        Template Syntax
                      </h4>
                      <p className="text-[color:var(--color-muted-foreground)]">
                        Use your variable in prompts with double braces:
                      </p>
                      <code className="mt-1 block rounded bg-[color:var(--color-surface-1)] p-2 font-mono text-xs">
                        {`{{${formData.key || 'your_key'}}}`}
                      </code>
                    </div>

                    <div>
                      <h4 className="mb-1 font-medium text-[color:var(--color-foreground)]">
                        Key Format
                      </h4>
                      <ul className="space-y-1 text-xs text-[color:var(--color-muted-foreground)]">
                        <li>• Only letters, numbers, and underscores</li>
                        <li>• No spaces or special characters</li>
                        <li>• Use snake_case for readability</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-1 font-medium text-[color:var(--color-foreground)]">
                        Examples
                      </h4>
                      <ul className="space-y-1 text-xs text-[color:var(--color-muted-foreground)]">
                        <li>• company_name</li>
                        <li>• user_role</li>
                        <li>• product_description</li>
                        <li>• target_audience</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.key && formData.value && (
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-[color:var(--color-muted-foreground)]">
                          Template:
                        </span>
                        <code className="mt-1 block rounded bg-[color:var(--color-surface-1)] p-2 font-mono text-xs">
                          {`{{${formData.key}}}`}
                        </code>
                      </div>
                      <div>
                        <span className="text-[color:var(--color-muted-foreground)]">
                          Will become:
                        </span>
                        <div className="mt-1 rounded bg-[color:var(--color-surface-1)] p-2 text-xs">
                          {formData.value}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button type="submit" variant="primary" disabled={saving} loading={saving}>
                  {saving ? 'Creating...' : 'Create Variable'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
