'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { PromptListItem, PromptFilters, PromptStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { SkeletonTable } from '@/components/ui/SkeletonLoader';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { useAlertModal } from '@/hooks/useModal';
//
import { useConfirmModal } from '@/hooks/useModal';

export default function PromptsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [prompts, setPrompts] = React.useState<PromptListItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<PromptFilters>({});
  const confirmModal = useConfirmModal();
  const alertModal = useAlertModal();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace('/login?redirect=/prompts');
    }
  }, [isPending, session, router]);

  const fetchPrompts = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));

      const response = await fetch(`/api/prompts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    if (session) {
      fetchPrompts();
    }
  }, [session, fetchPrompts]);

  const handleDeleteClick = (id: string, name: string) => {
    confirmModal.open(id, name);
  };

  const handleDeleteConfirm = async () => {
    const id = confirmModal.itemId;
    confirmModal.close();

    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPrompts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.userMessage || errorData.error?.message || 'Failed to delete prompt';
        alertModal.open('Delete Failed', msg, 'error');
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alertModal.open('Delete Failed', 'Network error while deleting prompt', 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}/duplicate`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchPrompts();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.userMessage ||
              errorData.error?.message ||
              'Failed to duplicate prompt';
        alertModal.open('Duplicate Failed', msg, 'error');
      }
    } catch (error) {
      console.error('Failed to duplicate prompt:', error);
      alertModal.open('Duplicate Failed', 'Network error while duplicating prompt', 'error');
    }
  };

  const formatTags = (tags: string[]) => {
    if (tags.length <= 2) {
      return tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[color:var(--color-accent)]/10 px-2 py-1 text-xs text-[color:var(--color-accent)]"
        >
          {tag}
        </span>
      ));
    }
    return [
      ...tags.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-[color:var(--color-accent)]/10 px-2 py-1 text-xs text-[color:var(--color-accent)]"
        >
          {tag}
        </span>
      )),
      <span
        key="more"
        className="rounded-full bg-[color:var(--color-surface-3)] px-2 py-1 text-xs text-[color:var(--color-muted-foreground)]"
      >
        +{tags.length - 2}
      </span>,
    ];
  };

  const getStatusBadge = (status: PromptStatus) => {
    const configs = {
      PUBLISHED: {
        bg: 'bg-[color:var(--color-success)]/10',
        text: 'text-[color:var(--color-success)]',
        icon: (
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
            <path d="m9 12 2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        ),
      },
      DRAFT: {
        bg: 'bg-[color:var(--color-warning)]/10',
        text: 'text-[color:var(--color-warning)]',
        icon: (
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
            <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
          </svg>
        ),
      },
      ARCHIVED: {
        bg: 'bg-[color:var(--color-surface-3)]',
        text: 'text-[color:var(--color-muted-foreground)]',
        icon: (
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
            <polyline points="21,8 21,21 3,21 3,8" />
            <rect width="18" height="5" x="3" y="3" />
            <line x1="10" x2="14" y1="12" y2="12" />
          </svg>
        ),
      },
    };

    const config = configs[status] || configs.DRAFT;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status}
      </span>
    );
  };

  if (!session) return null;

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
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <path d="M12 11h4" />
                  <path d="M12 16h4" />
                  <path d="M8 11h.01" />
                  <path d="M8 16h.01" />
                </svg>
              </div>
              Prompts
            </h1>
            <p className="text-responsive-base text-[color:var(--color-muted-foreground)]">
              Manage and organize your AI prompts for testing
            </p>
          </div>

          <Button onClick={() => router.push('/prompts/new')}>
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
            New Prompt
          </Button>
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

              <Select
                placeholder="All Statuses"
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (e.target.value as PromptStatus) || undefined,
                  }))
                }
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>

              <div></div>

              <div className="flex items-center text-sm text-[color:var(--color-muted-foreground)]">
                <span className="font-medium">{prompts.length}</span>
                <span className="ml-1">prompts found</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : prompts.length === 0 ? (
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
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="M12 11h4" />
                    <path d="M12 16h4" />
                    <path d="M8 11h.01" />
                    <path d="M8 16h.01" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                  No prompts found
                </h3>
                <p className="mx-auto mb-6 max-w-sm text-sm text-[color:var(--color-muted-foreground)]">
                  Create your first prompt to start building your collection for prompt testing and
                  comparison.
                </p>
                <button
                  onClick={() => router.push('/prompts/new')}
                  className="rounded-[var(--radius)] bg-[color:var(--color-accent)] px-4 py-2 text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
                >
                  Create First Prompt
                </button>
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
                      <th className="px-3 py-3 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                        Name
                      </th>
                      <th className="hidden px-3 py-3 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase xl:table-cell xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                        Tags
                      </th>
                      <th className="w-20 px-3 py-3 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                        Status
                      </th>
                      <th className="hidden w-28 px-3 py-3 text-left text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase lg:table-cell xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                        Updated
                      </th>
                      <th className="w-32 px-3 py-3 text-right text-xs font-semibold tracking-wider text-[color:var(--color-foreground)] uppercase xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--color-divider)]">
                    {prompts.map((prompt) => (
                      <tr
                        key={prompt.id}
                        className="transition-colors hover:bg-[color:var(--color-surface-1)]"
                      >
                        <td className="px-3 py-3 xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                          <div className="flex flex-col">
                            <span className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
                              {prompt.name}
                            </span>
                            {prompt.description && (
                              <span className="truncate text-xs text-[color:var(--color-muted-foreground)]">
                                {prompt.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-3 py-3 xl:table-cell xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                          <div className="flex flex-wrap gap-1">{formatTags(prompt.tags)}</div>
                        </td>
                        <td className="px-3 py-3 xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                          {getStatusBadge(prompt.status)}
                        </td>
                        <td className="hidden px-3 py-3 lg:table-cell xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                          <span className="text-sm text-[color:var(--color-muted-foreground)]">
                            {new Date(prompt.updatedAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-3 xl:px-4 xl:py-4 2xl:px-6 2xl:py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/prompts/${prompt.id}/edit`)}
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
                                className="xl:mr-1"
                              >
                                <path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                <path d="M10.4 12.6a2 2 0 1 1 3 3L8 21l-4 1 1-4Z" />
                              </svg>
                              <span className="hidden xl:inline">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(prompt.id)}
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
                                className="xl:mr-1"
                              >
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                              </svg>
                              <span className="hidden xl:inline">Copy</span>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(prompt.id, prompt.name)}
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
                                className="xl:mr-1"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                              </svg>
                              <span className="hidden xl:inline">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={handleDeleteConfirm}
        title="Delete Prompt"
        message={`Are you sure you want to delete the prompt "${confirmModal.itemName}"?\n\nThis action cannot be undone.`}
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
      />
    </div>
  );
}
