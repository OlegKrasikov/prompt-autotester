'use client';

import React from 'react';
import Link from 'next/link';
import { PromptFull, PromptStatus, CreatePromptRequest } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { PromptTextarea } from './ui/PromptTextarea';
import { Select } from './ui/Select';
import { useVariables } from '@/hooks/useVariables';

interface PromptFormProps {
  mode: 'create' | 'edit';
  initialData?: PromptFull;
  onSave: (prompt: PromptFull) => void;
  onCancel: () => void;
}

export default function PromptForm({ mode, initialData, onSave, onCancel }: PromptFormProps) {
  const { variables } = useVariables();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    content: initialData?.content || '',
    status: initialData?.status || ('DRAFT' as PromptStatus),
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    // Check for invalid variables
    const validVariableKeys = new Set(variables.map((v) => v.key));
    const variableRegex = /\{\{([^}]*)\}\}/g;
    const invalidVariables = [];
    let match;

    while ((match = variableRegex.exec(formData.content)) !== null) {
      const variableKey = match[1];
      if (!validVariableKeys.has(variableKey)) {
        invalidVariables.push(variableKey);
      }
    }

    if (invalidVariables.length > 0) {
      newErrors.content = `Invalid variables found: ${invalidVariables.map((v) => `{{${v}}}`).join(', ')}. Please create these variables first or remove them.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const promptData: CreatePromptRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        content: formData.content.trim(),
        status: formData.status,
        tags: formData.tags,
      };

      const url = mode === 'create' ? '/api/prompts' : `/api/prompts/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        console.error(`API Error (${response.status}):`, errorData);
        const msg =
          typeof errorData.error === 'string'
            ? errorData.error
            : errorData.error?.userMessage ||
              errorData.error?.message ||
              `Failed to ${mode} prompt: ${response.status} ${response.statusText}`;
        throw new Error(msg);
      }

      const result = await response.json();
      onSave(result);
    } catch (error) {
      console.error('Error saving prompt:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save prompt' });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
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
              {mode === 'create' ? 'Create New Prompt' : `Edit Prompt`}
            </h1>
            <p className="text-[color:var(--color-muted-foreground)]">
              {mode === 'create'
                ? 'Create a new prompt for testing and comparison'
                : 'Update your prompt content and settings'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
              {saving ? 'Saving...' : mode === 'create' ? 'Create Prompt' : 'Update Prompt'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="rounded-[var(--radius)] border border-[color:var(--color-danger)]/20 bg-[color:var(--color-danger)]/10 p-3 text-sm text-[color:var(--color-danger)]">
            {errors.submit}
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Prompt Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter prompt name..."
                    error={errors.name}
                    required
                  />

                  <Input
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of the prompt (optional)"
                  />

                  {/* Variables Onboarding Helper */}
                  {variables.length === 0 && (
                    <div className="rounded-[var(--radius)] border border-[color:var(--color-accent)]/20 bg-[color:var(--color-accent)]/10 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)]">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 8v4l2 2" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-[color:var(--color-accent)]">
                          Pro tip: Use Variables
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-[color:var(--color-foreground)]">
                        You can create variables so you won't need to repeat the same content in
                        multiple prompts. Type{' '}
                        <code className="rounded bg-[color:var(--color-surface-1)] px-1 py-0.5 font-mono text-xs">{`{{variable_name}}`}</code>{' '}
                        to insert them.
                      </p>
                      <Link
                        href="/variables"
                        className="text-sm font-medium text-[color:var(--color-accent)] hover:underline"
                      >
                        Create your first variable →
                      </Link>
                    </div>
                  )}

                  <PromptTextarea
                    label="Content"
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your prompt content here..."
                    rows={12}
                    className={`font-mono text-sm ${errors.content ? 'border-[color:var(--color-danger)]' : ''}`}
                    error={errors.content}
                    enableVariableAutocomplete={true}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Tags */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-sm">Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select
                    label="Status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, status: e.target.value as PromptStatus }))
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </Select>

                  <div>
                    <label className="mb-2 block text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase">
                      Tags
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Add tag..."
                          label=""
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={addTag}
                          disabled={!tagInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-accent)]/10 px-2 py-1 text-xs text-[color:var(--color-accent)]"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="transition-colors hover:text-[color:var(--color-danger)]"
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
                                >
                                  <path d="M18 6L6 18" />
                                  <path d="M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[color:var(--color-muted-foreground)] uppercase">
                    Character Count
                  </div>
                  <div className="text-sm text-[color:var(--color-foreground)]">
                    {formData.content.length.toLocaleString()} characters
                  </div>

                  {formData.content && (
                    <>
                      <div className="mt-4 text-xs font-medium text-[color:var(--color-muted-foreground)] uppercase">
                        Word Count
                      </div>
                      <div className="text-sm text-[color:var(--color-foreground)]">
                        {formData.content
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean)
                          .length.toLocaleString()}{' '}
                        words
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
