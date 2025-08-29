"use client";

import React from "react";
import { Spinner } from "./ui/Spinner";
import type { ModelConfig } from "@/lib/types";

const DEFAULT_MODELS = [
  { key: "gpt-5", name: "GPT-5", provider: "OpenAI", description: "State-of-the-art model with thinking capabilities", hasAdvancedOptions: true },
  { key: "gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI", description: "Compact version of GPT-5 with advanced reasoning", hasAdvancedOptions: true },
  { key: "gpt-5-nano", name: "GPT-5 Nano", provider: "OpenAI", description: "Ultra-fast lightweight version of GPT-5", hasAdvancedOptions: true },
];

// Uses shared ModelConfig type from src/lib/types

interface ModelPickerProps {
  value: ModelConfig;
  onChange: (config: ModelConfig) => void;
  models?: { key: string; name: string; provider?: string; description?: string; hasAdvancedOptions?: boolean }[];
  error?: string;
}

export function ModelPicker({ value, onChange, models = DEFAULT_MODELS, error }: ModelPickerProps) {
  const [apiKeys, setApiKeys] = React.useState<unknown[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchApiKeys = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch('/api/user/api-keys');
        if (response.ok) {
          const data = await response.json();
          setApiKeys(data.apiKeys || []);
        } else {
          setFetchError('Failed to load API keys');
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
        setFetchError('Network error loading API keys');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
  }, []);

  const selectedModel = models.find(m => m.key === value.model);
  const hasApiKeys = apiKeys.length > 0;
  const showAdvancedOptions = selectedModel?.hasAdvancedOptions && hasApiKeys;

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-[color:var(--color-foreground)] tracking-wide uppercase">
        AI Model
      </label>
      
      {/* Only show dropdown if loading or there are API keys */}
      {(loading || hasApiKeys) && (
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
            value={value.model}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            disabled={loading}
          >
            {loading ? (
              <option value="">Loading models...</option>
            ) : (
              models.map((model) => (
                <option key={model.key} value={model.key}>
                  {model.name} {model.provider && `(${model.provider})`}
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
      
      {/* Empty state only for no API keys */}
      {!loading && !hasApiKeys && (
        <div className="p-4 border border-[color:var(--color-border)] rounded-[var(--radius)] bg-[color:var(--color-surface-1)]">
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted-foreground)]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">
              No API Keys Configured
            </h3>
            <p className="text-xs text-[color:var(--color-muted-foreground)] mb-3">
              Add your AI model API keys to enable prompt testing
            </p>
            <button 
              onClick={() => window.location.href = "/settings"}
              className="px-3 py-1.5 text-xs bg-[color:var(--color-accent)] text-white rounded-[var(--radius)] hover:bg-[color:var(--color-accent-hover)] transition-colors"
            >
              Configure API Keys
            </button>
          </div>
        </div>
      )}
      
      {/* Advanced Options for GPT-5 models */}
      {showAdvancedOptions && (
        <>
          {/* Reasoning Effort */}
          <div>
            <label className="text-xs font-bold text-[color:var(--color-foreground)] tracking-wide uppercase">
              Reasoning Effort
            </label>
            <select
              className="w-full h-12 px-3 pr-10 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)] mt-2"
              value={value.reasoningEffort || "medium"}
              onChange={(e) => onChange({ ...value, reasoningEffort: e.target.value as "minimal" | "medium" | "high" })}
            >
              <option value="minimal">Minimal (Fast)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="high">High (Quality)</option>
            </select>
          </div>

          {/* Verbosity */}
          <div>
            <label className="text-xs font-bold text-[color:var(--color-foreground)] tracking-wide uppercase">
              Response Length
            </label>
            <select
              className="w-full h-12 px-3 pr-10 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)] mt-2"
              value={value.verbosity || "medium"}
              onChange={(e) => onChange({ ...value, verbosity: e.target.value as "low" | "medium" | "high" })}
            >
              <option value="low">Concise</option>
              <option value="medium">Balanced</option>
              <option value="high">Detailed</option>
            </select>
          </div>

          {/* Service Tier */}
          <div>
            <label className="text-xs font-bold text-[color:var(--color-foreground)] tracking-wide uppercase">
              Processing Priority
            </label>
            <select
              className="w-full h-12 px-3 pr-10 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)] mt-2"
              value={value.serviceTier || "default"}
              onChange={(e) => onChange({ ...value, serviceTier: e.target.value as "default" | "priority" })}
            >
              <option value="default">Standard</option>
              <option value="priority">Priority (Premium)</option>
            </select>
          </div>
        </>
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

