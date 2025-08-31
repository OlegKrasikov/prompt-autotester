'use client';

import React from 'react';
import { PromptTextarea } from './ui/PromptTextarea';

interface PromptEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  enableVariableAutocomplete?: boolean;
}

export function PromptEditor({
  label,
  value,
  onChange,
  placeholder = 'Write or paste your markdown prompt here...',
  error,
  hint,
  enableVariableAutocomplete = true,
}: PromptEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold tracking-wide text-[color:var(--color-foreground)] uppercase">
          {label}
        </label>
        <div className="flex items-center gap-1 text-xs text-[color:var(--color-muted-foreground)] sm:gap-2">
          <span className="hidden sm:inline">{value.length} characters</span>
          <span className="sm:hidden">{value.length}ch</span>
          {value.split('\n').length > 1 && (
            <>
              <span>•</span>
              <span className="hidden sm:inline">{value.split('\n').length} lines</span>
              <span className="sm:hidden">{value.split('\n').length}ln</span>
            </>
          )}
        </div>
      </div>

      <PromptTextarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="h-[200px] resize-none font-mono leading-relaxed"
        enableVariableAutocomplete={enableVariableAutocomplete}
        error={error}
        hint={hint}
      />

      {/* Word count and readability indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-[color:var(--color-muted-foreground)]">
        {value.trim() && (
          <>
            <span>{value.trim().split(/\s+/).length} words</span>
            <div
              className={`h-2 w-2 rounded-full ${
                value.length > 2000
                  ? 'bg-[color:var(--color-danger)]'
                  : value.length > 1000
                    ? 'bg-[color:var(--color-warning)]'
                    : 'bg-[color:var(--color-success)]'
              }`}
              title={
                value.length > 2000
                  ? 'Very long prompt'
                  : value.length > 1000
                    ? 'Long prompt'
                    : 'Good length'
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
