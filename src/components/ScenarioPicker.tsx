'use client';

import React from 'react';
import { ScenarioListItem } from '@/lib/types';
import { Spinner } from './ui/Spinner';

interface ScenarioPickerProps {
  value: string;
  onChange: (key: string) => void;
  error?: string;
  // Controlled data: presentational-only component (no internal fetching)
  scenariosData: {
    items: ScenarioListItem[];
    loading: boolean;
    error?: string | null;
  };
}

export function ScenarioPicker({ value, onChange, error, scenariosData }: ScenarioPickerProps) {
  const scenarios = scenariosData.items;
  const loading = scenariosData.loading;
  const fetchError = scenariosData.error ?? null;


  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-xs font-bold tracking-wide text-[color:var(--color-foreground)] uppercase">
        Test Scenario
      </label>

      {/* Only show dropdown if loading or there are scenarios */}
      {(loading || scenarios.length > 0) && (
        <div className="relative">
          <select
            className={`h-12 w-full cursor-pointer appearance-none rounded-[var(--radius)] border bg-[color:var(--color-surface)] px-3 pr-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-offset-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              error || fetchError
                ? 'border-[color:var(--color-danger)] focus:border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50'
                : 'border-[color:var(--color-border)] focus:border-[color:var(--color-accent)] focus:ring-[color:var(--color-accent)]/50'
            } `}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
          >
            {loading ? (
              <option value="">Loading scenarios...</option>
            ) : (
              scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                  {scenario.description
                    ? ` - ${scenario.description.slice(0, 45)}${scenario.description.length > 45 ? '...' : ''}`
                    : ''}
                </option>
              ))
            )}
          </select>

          {/* Loading spinner or dropdown arrow */}
          <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform text-[color:var(--color-muted-foreground)]">
            {loading ? (
              <Spinner size="sm" />
            ) : (
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
                <path d="m6 9 6 6 6-6" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Empty state for no scenarios */}
      {!loading && scenarios.length === 0 && (
        <div className="rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] p-4">
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 h-12 w-12 text-[color:var(--color-muted-foreground)]">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 13a3 3 0 1 0-6 0" />
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                <circle cx="12" cy="8" r="2" />
              </svg>
            </div>
            <h3 className="mb-1 text-sm font-medium text-[color:var(--color-foreground)]">
              No Published Scenarios
            </h3>
            <p className="mb-3 text-xs text-[color:var(--color-muted-foreground)]">
              Create and publish scenarios to enable prompt testing
            </p>
            <button
              onClick={() => (window.location.href = '/scenarios/new')}
              className="rounded-[var(--radius)] bg-[color:var(--color-accent)] px-3 py-1.5 text-xs text-white transition-colors hover:bg-[color:var(--color-accent-hover)]"
            >
              Create Scenario
            </button>
          </div>
        </div>
      )}

      {(error || fetchError) && (
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
          {error || fetchError}
        </p>
      )}
    </div>
  );
}
