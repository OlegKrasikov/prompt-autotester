'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { VariableListItem, VariableFilters } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/ui/SkeletonLoader';
import { Spinner } from '@/components/ui/Spinner';
import { VariableUsageModal } from '@/components/VariableUsageModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { useConfirmModal, useAlertModal } from '@/hooks/useModal';

export default function VariablesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [orgRole, setOrgRole] = React.useState<'ADMIN' | 'EDITOR' | 'VIEWER' | null>(null);
  const [roleLoading, setRoleLoading] = React.useState(true);
  const [variables, setVariables] = React.useState<VariableListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<VariableFilters>({});
  const [usageModal, setUsageModal] = React.useState<{
    isOpen: boolean;
    variableName: string;
    usage: {
      prompts: Array<{ id: string; name: string }>;
      scenarios: Array<{ id: string; name: string }>;
    };
  }>({
    isOpen: false,
    variableName: '',
    usage: { prompts: [], scenarios: [] },
  });
  const confirmModal = useConfirmModal();
  const alertModal = useAlertModal();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/variables');
    }
  }, [isPending, session, router]);

  React.useEffect(() => {
    // Resolve role via API (authoritative), fallback to cookie
    (async () => {
      try {
        const res = await fetch('/api/orgs');
        if (res.ok) {
          const data: Array<{ id: string; role: 'ADMIN'|'EDITOR'|'VIEWER'; isActive: boolean }> = await res.json();
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
      setRoleLoading(false);
    })().finally(() => setRoleLoading(false));
  }, []);

  const fetchVariables = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/variables?${params}`);
      if (response.ok) {
        const data = await response.json();
        setVariables(data);
      }
    } catch (error) {
      console.error('Failed to fetch variables:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    if (session) {
      fetchVariables();
    }
  }, [session, fetchVariables]);

  const handleDeleteClick = (id: string, variableName: string) => {
    confirmModal.open(id, variableName);
  };

  const handleDeleteConfirm = async () => {
    const id = confirmModal.itemId;
    const variableName = confirmModal.itemName;
    confirmModal.close();

    try {
      const response = await fetch(`/api/variables/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVariables();
      } else {
        const errorData = await response.json();

        if (response.status === 400 && errorData.usage) {
          // Variable is being used in prompts or scenarios - show usage modal
          setUsageModal({
            isOpen: true,
            variableName: variableName,
            usage: errorData.usage,
          });
        } else {
          // Show error in alert modal
          alertModal.open('Delete Failed', errorData.error || 'Failed to delete variable', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to delete variable:', error);
      alertModal.open(
        'Delete Failed',
        'Failed to delete variable. Please check your connection and try again.',
        'error',
      );
    }
  };

  const truncateValue = (value: string, maxLength: number = 40) => {
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength) + '...';
  };

  if (!session) return null;

  const isViewer = orgRole === 'VIEWER';

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              Variables
            </h1>
            <p className="text-[color:var(--color-muted-foreground)]">
              Manage reusable key-value pairs for prompt templates using {`{{key}}`} syntax
            </p>
          </div>

          {roleLoading ? (
            <div className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]">
              <Spinner size="sm" />
            </div>
          ) : !isViewer ? (
            <Button onClick={() => router.push('/variables/new')}>
              <svg
                width="16"
                height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
              New Variable
            </Button>
          ) : null}
        </div>

        {/* Filters */}
        <Card>
          <CardContent padding="lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input
                placeholder="Search"
                value={filters.search || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                leftIcon={
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                }
              />

              <div></div>
              <div></div>

              <div className="flex items-center text-sm text-[color:var(--color-muted-foreground)]">
                <span className="font-medium">{variables.length}</span>
                <span className="ml-1">variables found</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : variables.length === 0 ? (
          <Card>
            <CardContent>
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 h-16 w-16 text-[color:var(--color-muted-foreground)]">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                  No variables found
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-[color:var(--color-muted-foreground)]">
                  Create your first variable to start building reusable key-value pairs for prompt
                  templates.
                </p>
                {roleLoading ? (
                  <div className="mx-auto h-9 w-40 animate-pulse rounded-[var(--radius)] bg-[color:var(--color-surface-1)]" />
                ) : !isViewer ? (
                  <button
                    onClick={() => router.push('/variables/new')}
                    className="rounded-[var(--radius)] bg-[color:var(--color-accent)] px-4 py-2 text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
                  >
                    Create First Variable
                  </button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[color:var(--color-divider)] bg-[color:var(--color-surface-1)]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase">
                        Key
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase">
                        Value Preview
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase">
                        Updated
                      </th>
                      {(roleLoading || !isViewer) && (
                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-divider)]">
                    {variables.map((variable) => (
                      <tr
                        key={variable.id}
                        className="transition-colors hover:bg-[color:var(--color-surface-1)]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium text-[color:var(--color-foreground)]">
                              {variable.key}
                            </span>
                            <span className="font-mono text-xs text-[color:var(--color-muted-foreground)]">
                              {`{{${variable.key}}}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block max-w-xs truncate text-sm text-[color:var(--color-muted-foreground)]">
                            {truncateValue(variable.value)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block max-w-xs truncate text-sm text-[color:var(--color-muted-foreground)]">
                            {variable.description || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[color:var(--color-muted-foreground)]">
                            {new Date(variable.updatedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        {(roleLoading || !isViewer) && (
                          <td className="px-6 py-4">
                            {roleLoading ? (
                              <div className="ml-auto h-8 w-32 animate-pulse rounded-[var(--radius)] bg-[color:var(--color-surface-1)]" />
                            ) : !isViewer ? (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/variables/${variable.id}/edit`)}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
                                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                    <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
                                  </svg>
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(variable.id, variable.key)}
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  </svg>
                                  Delete
                                </Button>
                              </div>
                            ) : null}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Variable Usage Modal */}
      <VariableUsageModal
        isOpen={usageModal.isOpen}
        onClose={() => setUsageModal((prev) => ({ ...prev, isOpen: false }))}
        variableName={usageModal.variableName}
        usage={usageModal.usage}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={handleDeleteConfirm}
        title="Delete Variable"
        message={`Are you sure you want to delete the variable "{{${confirmModal.itemName}}}"?\n\nThis action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        cancelText="Cancel"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttonText="OK"
      />
    </div>
  );
}
