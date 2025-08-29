'use client'

import React from 'react';
import { ScenarioFull, ScenarioTurn, ScenarioExpectation, ScenarioStatus, ExpectationType, CreateScenarioRequest } from '@/lib/types';
import { validateScenarioName, validateExpectationKey } from '@/lib/utils/scenario-utils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Spinner } from './ui/Spinner';

interface ScenarioEditorProps {
  mode: 'create' | 'edit';
  initialData?: ScenarioFull;
  onSave: (scenario: ScenarioFull) => void;
  onCancel: () => void;
}

export default function ScenarioEditor({ mode, initialData, onSave, onCancel }: ScenarioEditorProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    locale: initialData?.locale || 'en',
    status: initialData?.status || 'DRAFT' as ScenarioStatus,
    tags: initialData?.tags || [],
  });

  const [turns, setTurns] = React.useState<ScenarioTurn[]>(
    initialData?.turns || []
  );

  const [tagInput, setTagInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [showRawJson, setShowRawJson] = React.useState(false);

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addUserStep = () => {
    const newStep: ScenarioTurn = {
      orderIndex: turns.length,
      turnType: 'USER',
      userText: '',
      expectations: []
    };
    setTurns(prev => [...prev, newStep]);
  };

  const addExpectStep = () => {
    const newStep: ScenarioTurn = {
      orderIndex: turns.length,
      turnType: 'EXPECT',
      expectations: [{
        expectationType: 'MUST_CONTAIN' as ExpectationType,
        expectationKey: '',
        argsJson: { text: '' }
      }]
    };
    setTurns(prev => [...prev, newStep]);
  };

  const updateStep = (index: number, updates: Partial<ScenarioTurn>) => {
    setTurns(prev => prev.map((turn, i) => 
      i === index ? { ...turn, ...updates } : turn
    ));
  };

  const removeStep = (index: number) => {
    setTurns(prev => prev.filter((_, i) => i !== index).map((turn, i) => ({ ...turn, orderIndex: i })));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || turns.length === 0) {
      return;
    }

    setSaving(true);
    try {
      setSubmitError(null);
      const scenarioData: CreateScenarioRequest = {
        name: formData.name,
        description: formData.description,
        locale: formData.locale,
        status: formData.status,
        tags: formData.tags,
        turns: turns.map((turn, i) => ({ ...turn, orderIndex: i }))
      };


      const url = mode === 'create' ? '/api/scenarios' : `/api/scenarios/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = typeof errorData.error === 'string'
          ? errorData.error
          : (errorData.error?.userMessage || errorData.error?.message || `Failed to ${mode} scenario`);
        throw new Error(msg);
      }

      const result = await response.json();
      onSave(result.scenario || result);
    } catch (error) {
      console.error('Error saving scenario:', error);
      setSubmitError(error instanceof Error ? error.message : `Failed to ${mode} scenario`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[color:var(--color-background)]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
              {mode === 'create' ? 'Create New Scenario' : `Edit Scenario`}
            </h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {mode === 'create' ? 'Build a new test scenario for prompt evaluation' : 'Update your test scenario'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowRawJson(!showRawJson)}
            >
              {showRawJson ? 'Hide' : 'Show'} JSON
            </Button>
            <Button
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving || !formData.name.trim() || turns.length === 0}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Scenario'}
            </Button>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-[var(--radius)] text-sm bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)] border border-[color:var(--color-danger)]/20">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Scenario Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter scenario name"
                      required
                    />
                    <Select
                      label="Language"
                      value={formData.locale}
                      onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                    </Select>
                  </div>
                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  </svg>
                  Conversation Steps ({turns.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {turns.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted-foreground)]">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                      No Steps Added Yet
                    </h3>
                    <p className="text-xs text-[color:var(--color-muted-foreground)] mb-4">
                      Add user messages and expectations to build your test scenario
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turns.map((turn, index) => (
                      <React.Fragment key={index}>
                        <StepCard
                          step={turn}
                          index={index}
                          onUpdate={(updates) => updateStep(index, updates)}
                          onRemove={() => removeStep(index)}
                        />
                        {/* AI Response Placeholder after User steps */}
                        {turn.turnType === 'USER' && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] border border-dashed border-[color:var(--color-muted-foreground)]/30 bg-[color:var(--color-surface-1)]/30">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium bg-[color:var(--color-muted-foreground)] text-white">
                              AI
                            </span>
                            <span className="text-xs text-[color:var(--color-muted-foreground)] italic">
                              AI will respond according to your prompt...
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                
                {/* Add Step Buttons - Always at bottom */}
                <div className="flex justify-center gap-2 pt-4 mt-4 border-t border-[color:var(--color-divider)]">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={addUserStep}
                  >
                    + User
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={addExpectStep}
                  >
                    + Expect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags and Status - same height as Basic Info */}
            <div className="h-[280px]">
              <Card variant="elevated" className="h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="space-y-4">
                    {/* Status */}
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-foreground)] tracking-wide uppercase mb-2 block">
                        Status
                      </label>
                      <Select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ScenarioStatus }))}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </Select>
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <label className="text-xs font-medium text-[color:var(--color-foreground)] tracking-wide uppercase mb-2 block">
                        Tags
                      </label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add tag"
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          />
                          <Button
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
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] rounded-full"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-[color:var(--color-danger)]"
                                >
                                  ×
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
            </div>
            
            
            {/* Conversation Preview - aligned with Steps */}
            <div className="sticky top-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Conversation Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {turns.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-xs text-[color:var(--color-muted-foreground)]">
                          Add steps to see conversation preview
                        </p>
                      </div>
                    ) : (
                      <>
                        {turns.map((turn, index) => (
                          <React.Fragment key={index}>
                            {turn.turnType === 'USER' ? (
                              <>
                                {/* User Message */}
                                <div className="flex gap-2">
                                  <div className="w-4 h-4 rounded-full bg-[color:var(--color-success)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-white font-medium">U</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-[color:var(--color-foreground)]">
                                      {turn.userText || <em className="text-[color:var(--color-muted-foreground)]">Enter user message...</em>}
                                    </p>
                                  </div>
                                </div>
                                {/* AI Response Placeholder */}
                                <div className="flex gap-2">
                                  <div className="w-4 h-4 rounded-full bg-[color:var(--color-muted-foreground)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs text-white font-medium">AI</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs text-[color:var(--color-muted-foreground)] italic">
                                      AI response...
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* Expectation Step */
                              <div className="flex gap-2">
                                <div className="w-4 h-4 rounded-full bg-[color:var(--color-accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs text-white font-medium">✓</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-[color:var(--color-accent)]">
                                    Check: {turn.expectations?.[0]?.expectationType || 'MUST_CONTAIN'} "
                                    {(turn.expectations?.[0]?.argsJson as any)?.text || <em className="text-[color:var(--color-muted-foreground)]">Enter expected text...</em>}"
                                  </p>
                                </div>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Raw JSON */}
        {showRawJson && (
          <Card variant="outlined">
            <CardHeader>
              <CardTitle className="text-sm">Raw JSON</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-[color:var(--color-surface-1)] p-4 rounded-[var(--radius)] overflow-auto">
                {JSON.stringify({ ...formData, turns }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Step Card Component
interface StepCardProps {
  step: ScenarioTurn;
  index: number;
  onUpdate: (updates: Partial<ScenarioTurn>) => void;
  onRemove: () => void;
}

function StepCard({ step, index, onUpdate, onRemove }: StepCardProps) {
  const isUser = step.turnType === 'USER';
  
  return (
    <div className={`p-4 rounded-[var(--radius)] border-2 ${isUser ? 'border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/5' : 'border-[color:var(--color-accent)]/20 bg-[color:var(--color-accent)]/5'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${isUser ? 'bg-[color:var(--color-success)] text-white' : 'bg-[color:var(--color-accent)] text-white'}`}>
            {index + 1}
          </span>
          <span className="text-sm font-medium">
            {isUser ? 'User Message' : 'Expectation'}
          </span>
        </div>
        <Button
          size="sm"
          variant="danger"
          onClick={onRemove}
        >
          ×
        </Button>
      </div>

      {isUser ? (
        <Textarea
          value={step.userText || ''}
          onChange={(e) => onUpdate({ userText: e.target.value })}
          placeholder="User message..."
          rows={2}
        />
      ) : (
        <div className="space-y-2">
          <Select
            value={step.expectations?.[0]?.expectationType || 'MUST_CONTAIN'}
            onChange={(e) => onUpdate({
              expectations: [{
                expectationType: e.target.value as ExpectationType,
                expectationKey: step.expectations?.[0]?.expectationKey || '',
                argsJson: step.expectations?.[0]?.argsJson || { text: '' }
              }]
            })}
          >
            <option value="MUST_CONTAIN">Must Contain</option>
            <option value="MUST_NOT_CONTAIN">Must Not Contain</option>
            <option value="REGEX">Regex Match</option>
          </Select>
          <Input
            value={(step.expectations?.[0]?.argsJson as any)?.text || ''}
            onChange={(e) => onUpdate({
              expectations: [{
                expectationType: step.expectations?.[0]?.expectationType || 'MUST_CONTAIN',
                expectationKey: step.expectations?.[0]?.expectationKey || '',
                argsJson: { text: e.target.value }
              }]
            })}
            placeholder="Expected text..."
          />
        </div>
      )}
    </div>
  );
}
