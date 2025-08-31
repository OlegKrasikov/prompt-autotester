'use client';

import React from 'react';
import { PromptEditor } from '@/components/PromptEditor';
import { PromptPicker } from '@/components/PromptPicker';
import { PromptDiff } from '@/components/PromptDiff';
import { ConversationView } from '@/components/ConversationView';
import { ScenarioPicker } from '@/components/ScenarioPicker';
import { ModelPicker } from '@/components/ModelPicker';
import type { ModelConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { useConfirmModal, useAlertModal } from '@/hooks/useModal';
import { SimulateResponseBody, ScenarioListItem } from '@/lib/types';

interface TestingMainContentProps {
  // Prompt state
  selectedPromptId: string;
  oldPrompt: string;
  newPrompt: string;
  onPromptSelection: (promptId: string, promptContent: string) => void;
  onNewPromptChange: (value: string) => void;

  // Scenario state
  scenarioKey: string;
  onScenarioChange: (key: string) => void;

  // Model state
  model: ModelConfig;
  onModelChange: (config: ModelConfig) => void;

  // Actions
  onRunSimulation: () => void;
  canRun: boolean;

  // Status
  hasApiKeys: boolean;
  apiKeysLoading: boolean;
  statusMessage: string | null;

  // Loading states
  promptsLoading: boolean;
  hasPrompts: boolean;

  // Simulation results
  sim: SimulateResponseBody | null;
  loading: boolean;
  streamingState: {
    current: boolean;
    edited: boolean;
  };

  // Error handling
  error: string | null;

  // Scenarios data (optional centralization)
  scenariosData?: {
    items: ScenarioListItem[];
    loading: boolean;
    error: string | null;
  };
}

export function TestingMainContent({
  selectedPromptId,
  oldPrompt,
  newPrompt,
  onPromptSelection,
  onNewPromptChange,
  scenarioKey,
  onScenarioChange,
  model,
  onModelChange,
  onRunSimulation,
  canRun,
  hasApiKeys: _hasApiKeys,
  apiKeysLoading: _apiKeysLoading,
  statusMessage,
  promptsLoading,
  hasPrompts,
  sim,
  loading,
  streamingState,
  error,
  scenariosData,
}: TestingMainContentProps) {
  const router = React.useMemo(
    () => ({
      push: (path: string) => {
        if (typeof window !== 'undefined') {
          window.location.href = path;
        }
      },
    }),
    [],
  );

  // Modal states for overwrite functionality
  const confirmModal = useConfirmModal();
  const alertModal = useAlertModal();
  const [isOverwriting, setIsOverwriting] = React.useState(false);

  // Check if prompts are different and results exist to show overwrite button
  const canOverwrite = selectedPromptId && sim && oldPrompt !== newPrompt && !loading;

  const handleOverwriteClick = () => {
    confirmModal.open(selectedPromptId, 'current prompt');
  };

  const handleOverwriteConfirm = async () => {
    if (!selectedPromptId) return;

    setIsOverwriting(true);
    confirmModal.close();

    try {
      // Get the current prompt details first to preserve name and other metadata
      const currentPromptResponse = await fetch(`/api/prompts/${selectedPromptId}`);
      if (!currentPromptResponse.ok) {
        throw new Error('Failed to fetch current prompt details');
      }

      const currentPrompt = await currentPromptResponse.json();

      // Update the prompt content with the new version
      const updateResponse = await fetch(`/api/prompts/${selectedPromptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentPrompt.name,
          description: currentPrompt.description,
          content: newPrompt,
          status: currentPrompt.status,
          tags: currentPrompt.tags,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        const msg =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.userMessage || errorData.error?.message || 'Failed to update prompt';
        throw new Error(msg);
      }

      // Update the old prompt state to match the new one
      onPromptSelection(selectedPromptId, newPrompt);

      // Show success message
      alertModal.open(
        'Prompt Updated Successfully',
        'Your prompt has been updated with the improved version. Great work on optimizing it!',
        'success',
      );
    } catch (error) {
      console.error('Error overwriting prompt:', error);
      alertModal.open(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update prompt. Please try again.',
        'error',
      );
    } finally {
      setIsOverwriting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-[color:var(--color-foreground)] sm:mb-2 sm:gap-3 sm:text-2xl">
            <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius)] bg-[color:var(--color-accent)] sm:h-8 sm:w-8">
              <svg
                width="14"
                height="14"
                className="sm:h-[18px] sm:w-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
                <path d="M2 6h4" />
                <path d="M2 10h4" />
                <path d="M2 14h4" />
                <path d="M2 18h4" />
                <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
              </svg>
            </div>
            <span className="hidden sm:inline">Prompt Testing</span>
            <span className="sm:hidden">Testing</span>
          </h1>
          <p className="hidden text-sm text-[color:var(--color-muted-foreground)] sm:block sm:text-base">
            Compare prompt versions with side-by-side conversation simulations
          </p>
          <p className="text-sm text-[color:var(--color-muted-foreground)] sm:hidden">
            Compare prompt versions
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card
          variant="outlined"
          className="border-[color:var(--color-danger)] bg-[color:var(--color-danger-light)]/5"
        >
          <CardContent padding="sm">
            <div className="flex items-center gap-2 text-[color:var(--color-danger)]">
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
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Main Containers Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Container - Test Scenario (1/4) */}
        <Card variant="elevated" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Test Scenario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scenario Selection */}
            <div>
              <ScenarioPicker
                value={scenarioKey}
                onChange={onScenarioChange}
                error={error && !scenarioKey ? 'Scenario required' : undefined}
                scenariosData={{
                  items: scenariosData?.items || [],
                  loading: scenariosData?.loading ?? true,
                  error: scenariosData?.error ?? null,
                }}
              />
            </div>

            {/* Settings */}
            <div className="border-t border-[color:var(--color-border)] pt-4">
              <div className="mb-3 text-sm font-medium text-[color:var(--color-foreground)]">
                Settings
              </div>
              <ModelPicker value={model} onChange={onModelChange} />
            </div>

            {/* Run Button - moved to bottom */}
            <Button
              size="lg"
              variant="primary"
              loading={loading}
              disabled={!canRun || loading}
              onClick={onRunSimulation}
              className="w-full"
            >
              {loading ? (
                <span>Running...</span>
              ) : (
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
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Run Test
                </div>
              )}
            </Button>

            {/* Status Message */}
            {statusMessage && (
              <div className="rounded-[var(--radius)] border border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/10 p-3">
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 text-[color:var(--color-warning)]"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="text-sm text-[color:var(--color-warning)]">{statusMessage}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Container - Prompt Comparison (3/4) */}
        <Card variant="elevated" className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Prompt Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {promptsLoading ? (
              <div className="flex items-center justify-center gap-3 py-8">
                <Spinner size="sm" />
                <span className="text-sm text-[color:var(--color-muted-foreground)]">
                  Loading prompts...
                </span>
              </div>
            ) : !hasPrompts ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius)]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[color:var(--color-muted-foreground)]"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                  No Published Prompts Available
                </h3>
                <p className="mx-auto mb-4 max-w-md text-sm text-[color:var(--color-muted-foreground)]">
                  To start testing prompts, you need to create and publish at least one prompt.
                  Create your first prompt to unlock the full testing experience.
                </p>
                <Button onClick={() => router.push('/prompts/new')} className="mx-auto">
                  Create Your First Prompt
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Prompt Selection */}
                <div className="space-y-3">
                  <PromptPicker
                    value={selectedPromptId}
                    onChange={onPromptSelection}
                    error={!selectedPromptId ? 'Please choose a prompt' : undefined}
                  />
                  <div className="text-xs text-[color:var(--color-muted-foreground)]">
                    Select a published prompt to automatically fill the &quot;Current prompt&quot;
                    field, or type your own prompt below.
                  </div>
                </div>

                {/* Prompt Editors */}
                {selectedPromptId && (
                  <ResponsiveGrid
                    cols={{
                      sm: 1,
                      md: 3, // Keep 3 columns from medium screens up for better UX
                      lg: 3, // 3 columns: Current + Edited + Diff
                      xl: 3, // HD: 3 columns (baseline)
                      '2xl': 3, // FHD: 3 columns with more spacing
                      '3xl': 4, // FHD Wide: 4 columns (Current + Edited + Diff + Preview)
                      '4xl': 5, // QHD: 5 columns (additional metadata column)
                    }}
                    gap="lg"
                  >
                    {/* Read-only Current Prompt Display */}
                    <div
                      className="flex w-full touch-pan-y flex-col gap-2"
                      role="region"
                      aria-label="Current prompt view"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase">
                          Current prompt
                        </label>
                        <div className="flex items-center gap-1 text-xs text-[color:var(--color-muted-foreground)] sm:gap-2">
                          <span className="hidden sm:inline">{oldPrompt.length} characters</span>
                          <span className="sm:hidden">{oldPrompt.length}ch</span>
                          {oldPrompt.split('\n').length > 1 && (
                            <>
                              <span>•</span>
                              <span className="hidden sm:inline">
                                {oldPrompt.split('\n').length} lines
                              </span>
                              <span className="sm:hidden">{oldPrompt.split('\n').length}ln</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div
                        className="scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent hover:scrollbar-thumb-[color:var(--color-accent)]/50 h-[200px] w-full touch-pan-y overflow-auto rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-2 font-mono text-sm leading-relaxed whitespace-pre-wrap sm:p-3"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        {oldPrompt || (
                          <span className="text-[color:var(--color-muted-foreground)]">
                            Your existing prompt version
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                        {oldPrompt.trim() && (
                          <>
                            <span className="hidden sm:inline">
                              {oldPrompt.trim().split(/\s+/).length} words
                            </span>
                            <span className="sm:hidden">
                              {oldPrompt.trim().split(/\s+/).length}w
                            </span>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                oldPrompt.length > 2000
                                  ? 'bg-[color:var(--color-danger)]'
                                  : oldPrompt.length > 1000
                                    ? 'bg-[color:var(--color-warning)]'
                                    : 'bg-[color:var(--color-success)]'
                              }`}
                              title={
                                oldPrompt.length > 2000
                                  ? 'Very long prompt'
                                  : oldPrompt.length > 1000
                                    ? 'Long prompt'
                                    : 'Good length'
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Editable New Prompt */}
                    <PromptEditor
                      label="Edited prompt"
                      value={newPrompt}
                      onChange={onNewPromptChange}
                    />

                    {/* Live Diff */}
                    <PromptDiff oldText={oldPrompt} newText={newPrompt} />

                    {/* Preview Column (4th column - FHD Wide+) */}
                    <div
                      className="3xl:flex hidden w-full flex-col gap-2"
                      role="region"
                      aria-label="Prompt preview"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase">
                          Preview
                        </label>
                        <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                          <span>Variables resolved</span>
                        </div>
                      </div>

                      <div className="h-[200px] w-full overflow-auto rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {newPrompt ? (
                          <span className="text-[color:var(--color-foreground)]">
                            {/* This would show the prompt with variables resolved */}
                            {newPrompt}
                          </span>
                        ) : (
                          <span className="text-[color:var(--color-muted-foreground)]">
                            Preview with variables resolved
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 text-xs text-[color:var(--color-muted-foreground)]">
                        <span>Ready for testing</span>
                        <div className="h-2 w-2 rounded-full bg-[color:var(--color-success)]" />
                      </div>
                    </div>

                    {/* Metadata Column (5th column - QHD+) */}
                    <div
                      className="4xl:flex hidden w-full flex-col gap-2"
                      role="region"
                      aria-label="Prompt metadata"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase">
                          Metadata
                        </label>
                      </div>

                      <div className="space-y-3 rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[color:var(--color-muted-foreground)]">
                              Length change:
                            </span>
                            <span
                              className={`font-medium ${
                                newPrompt.length > oldPrompt.length
                                  ? 'text-[color:var(--color-warning)]'
                                  : newPrompt.length < oldPrompt.length
                                    ? 'text-[color:var(--color-success)]'
                                    : 'text-[color:var(--color-muted-foreground)]'
                              }`}
                            >
                              {newPrompt.length > oldPrompt.length ? '+' : ''}
                              {newPrompt.length - oldPrompt.length} chars
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[color:var(--color-muted-foreground)]">
                              Word change:
                            </span>
                            <span
                              className={`font-medium ${
                                newPrompt.trim().split(/\s+/).length >
                                oldPrompt.trim().split(/\s+/).length
                                  ? 'text-[color:var(--color-warning)]'
                                  : newPrompt.trim().split(/\s+/).length <
                                      oldPrompt.trim().split(/\s+/).length
                                    ? 'text-[color:var(--color-success)]'
                                    : 'text-[color:var(--color-muted-foreground)]'
                              }`}
                            >
                              {newPrompt.trim().split(/\s+/).length >
                              oldPrompt.trim().split(/\s+/).length
                                ? '+'
                                : ''}
                              {newPrompt.trim().split(/\s+/).length -
                                oldPrompt.trim().split(/\s+/).length}{' '}
                              words
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[color:var(--color-muted-foreground)]">
                              Complexity:
                            </span>
                            <span className="font-medium text-[color:var(--color-foreground)]">
                              {newPrompt.split('\n').length > 10
                                ? 'High'
                                : newPrompt.split('\n').length > 5
                                  ? 'Medium'
                                  : 'Simple'}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[color:var(--color-muted-foreground)]">
                              Variables:
                            </span>
                            <span className="font-medium text-[color:var(--color-foreground)]">
                              {(newPrompt.match(/\{\{[^}]+\}\}/g) || []).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ResponsiveGrid>
                )}
              </div>
            )}
            {/* Conversation Results */}
            {(sim || loading) && (
              <div className="mt-6 border-t border-[color:var(--color-border)] pt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[color:var(--color-foreground)]">
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M8 10h8" />
                      <path d="M8 14h6" />
                    </svg>
                    Conversation Results
                    {loading && <Spinner size="sm" className="ml-2" />}
                  </h3>

                  {/* Overwrite Button - only show if results exist and prompts differ */}
                  {canOverwrite && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleOverwriteClick}
                      disabled={isOverwriting}
                      loading={isOverwriting}
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
                        <path d="M3 17v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
                        <path d="M7 11l5-5 5 5" />
                        <path d="M12 16V6" />
                      </svg>
                      {isOverwriting ? 'Updating...' : 'Update Prompt'}
                    </Button>
                  )}
                </div>

                {/* Always side-by-side comparison for easier evaluation */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                  <ConversationView
                    title="Current Prompt Results"
                    conversation={sim?.old}
                    loading={loading}
                    isStreaming={streamingState.current}
                  />
                  <ConversationView
                    title="Edited Prompt Results"
                    conversation={sim?.new}
                    loading={loading}
                    isStreaming={streamingState.edited}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal for Overwrite */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={handleOverwriteConfirm}
        title="Update Prompt"
        message={`Ready to update your prompt with the improved version?\n\nThis will save your changes to the stored prompt. You can always edit it again later if needed.`}
        confirmText="Update Prompt"
        confirmVariant="success"
        cancelText="Cancel"
        isLoading={isOverwriting}
      />

      {/* Alert Modal for Success/Error Messages */}
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
