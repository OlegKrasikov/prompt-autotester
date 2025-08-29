'use client'

import React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { VariableFull, UpdateVariableRequest } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

interface EditVariablePageProps {
  params: { id: string };
}

export default function EditVariablePage({ params }: EditVariablePageProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [variable, setVariable] = React.useState<VariableFull | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [formData, setFormData] = React.useState<UpdateVariableRequest>({
    key: '',
    value: '',
    description: '',
  });
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const resolvedParams = params;

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace(`/login?redirect=/variables/${resolvedParams.id}/edit`);
    }
  }, [isPending, session, router, resolvedParams.id]);

  const fetchVariable = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/variables/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setVariable(data);
        setFormData({
          key: data.key,
          value: data.value,
          description: data.description || '',
        });
      } else if (response.status === 404) {
        router.push('/variables');
      }
    } catch (error) {
      console.error('Failed to fetch variable:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  React.useEffect(() => {
    if (session) {
      fetchVariable();
    }
  }, [session, fetchVariable]);

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
      const response = await fetch(`/api/variables/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/variables');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg = typeof errorData.error === 'string'
          ? errorData.error
          : (errorData.error?.userMessage || errorData.error?.message || 'Failed to update variable');
        setErrors({ submit: msg });
      }
    } catch (error) {
      console.error('Error updating variable:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/variables');
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-[color:var(--color-background)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!variable) {
    return (
      <div className="min-h-screen p-6 bg-[color:var(--color-background)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)] mb-2">
              Variable not found
            </h2>
            <p className="text-[color:var(--color-muted-foreground)] mb-6">
              The variable you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push('/variables')}>
              Back to Variables
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[color:var(--color-background)]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[color:var(--color-foreground)] mb-2">
            <div className="w-8 h-8 bg-[color:var(--color-accent)] rounded-[var(--radius)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
              </svg>
            </div>
            Edit Variable
          </h1>
          <p className="text-[color:var(--color-muted-foreground)]">
            Update your reusable key-value pair for prompt templates
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Variable Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      label="Key"
                      value={formData.key}
                      onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                      placeholder="e.g., company_name, user_role, product_type"
                      error={errors.key}
                      required
                    />

                    <Input
                      label="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description of this variable"
                      error={errors.description}
                    />

                    <Textarea
                      label="Value"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder="Enter value..."
                      rows={6}
                      error={errors.value}
                      required
                    />

                    {errors.submit && (
                      <div className="p-3 rounded-[var(--radius)] text-sm bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] border border-[color:var(--color-danger)]/20">
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
                      <h4 className="font-medium text-[color:var(--color-foreground)] mb-1">Template Syntax</h4>
                      <p className="text-[color:var(--color-muted-foreground)]">
                        Use your variable in prompts with double braces:
                      </p>
                      <code className="block mt-1 p-2 bg-[color:var(--color-surface-1)] rounded text-xs font-mono">
                        {`{{${formData.key || 'your_key'}}}`}
                      </code>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-[color:var(--color-foreground)] mb-1">Key Format</h4>
                      <ul className="text-[color:var(--color-muted-foreground)] text-xs space-y-1">
                        <li>• Only letters, numbers, and underscores</li>
                        <li>• No spaces or special characters</li>
                        <li>• Use snake_case for readability</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-[color:var(--color-foreground)] mb-1">Last Updated</h4>
                      <p className="text-[color:var(--color-muted-foreground)] text-xs">
                        {new Date(variable.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
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
                        <span className="text-[color:var(--color-muted-foreground)]">Template:</span>
                        <code className="block mt-1 p-2 bg-[color:var(--color-surface-1)] rounded text-xs font-mono">
                          {`{{${formData.key}}}`}
                        </code>
                      </div>
                      <div>
                        <span className="text-[color:var(--color-muted-foreground)]">Will become:</span>
                        <div className="mt-1 p-2 bg-[color:var(--color-surface-1)] rounded text-xs">
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
                  {saving ? 'Updating...' : 'Update Variable'}
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
