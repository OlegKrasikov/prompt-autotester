"use client";

import React from "react";
import { ScenarioListItem } from "@/lib/types";
import { Spinner } from "./ui/Spinner";

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

  const selectedScenario = scenarios.find(s => s.id === value);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-[color:var(--color-foreground)] tracking-wide uppercase">
        Test Scenario
      </label>
      
      {/* Only show dropdown if loading or there are scenarios */}
      {(loading || scenarios.length > 0) && (
        <div className="relative">
          <select
            className={`
              w-full h-12 px-3 pr-10 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] 
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 
              appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              ${error || fetchError
                ? 'border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]'
                : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]'
              }
            `}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
          >
            {loading ? (
              <option value="">Loading scenarios...</option>
            ) : (
              scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}{scenario.description ? ` - ${scenario.description.slice(0, 45)}${scenario.description.length > 45 ? '...' : ''}` : ''}
                </option>
              ))
            )}
          </select>
          
          {/* Loading spinner or dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[color:var(--color-muted-foreground)]">
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* Empty state for no scenarios */}
      {!loading && scenarios.length === 0 && (
        <div className="p-4 border border-[color:var(--color-border)] rounded-[var(--radius)] bg-[color:var(--color-surface-1)]">
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted-foreground)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 13a3 3 0 1 0-6 0"/>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
                <circle cx="12" cy="8" r="2"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">
              No Published Scenarios
            </h3>
            <p className="text-xs text-[color:var(--color-muted-foreground)] mb-3">
              Create and publish scenarios to enable prompt testing
            </p>
            <button 
              onClick={() => window.location.href = "/scenarios/new"}
              className="px-3 py-1.5 text-xs bg-[color:var(--color-accent)] text-white rounded-[var(--radius)] hover:bg-[color:var(--color-accent-hover)] transition-colors"
            >
              Create Scenario
            </button>
          </div>
        </div>
      )}
      
      {(error || fetchError) && (
        <p className="text-xs text-[color:var(--color-danger)] flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error || fetchError}
        </p>
      )}
    </div>
  );
}
