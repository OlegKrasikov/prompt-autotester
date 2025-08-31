'use client';

import React from 'react';
import { diffWords } from 'diff';
//

interface PromptDiffProps {
  oldText: string;
  newText: string;
}

export function PromptDiff({ oldText, newText }: PromptDiffProps) {
  const parts = React.useMemo(() => diffWords(oldText, newText), [oldText, newText]);

  const addedCount = parts.filter((part) => part.added).length;
  const removedCount = parts.filter((part) => part.removed).length;
  const hasChanges = addedCount > 0 || removedCount > 0;

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold tracking-wide text-[color:var(--color-foreground)] uppercase">
          Live Diff
        </label>
        <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
          <span>{Math.max(oldText.length, newText.length)} characters</span>
          {Math.max(oldText.split('\n').length, newText.split('\n').length) > 1 && (
            <>
              <span>•</span>
              <span>{Math.max(oldText.split('\n').length, newText.split('\n').length)} lines</span>
            </>
          )}
        </div>
      </div>

      <div className="relative rounded-[var(--radius-md)] transition-all duration-200">
        <div
          ref={containerRef}
          className={`h-[200px] w-full overflow-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 font-mono text-sm leading-relaxed transition-all duration-200`}
        >
          {!oldText.trim() && !newText.trim() ? (
            <div className="py-8 text-center text-[color:var(--color-muted-foreground)]">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              <p className="text-sm">No prompts to compare</p>
              <p className="mt-1 text-xs">Enter prompts to see the differences</p>
            </div>
          ) : !hasChanges && oldText === newText ? (
            <div className="py-8 text-center text-[color:var(--color-muted-foreground)]">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <path d="m9 12 2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <p className="text-sm">Prompts are identical</p>
              <p className="mt-1 text-xs">No differences to display</p>
            </div>
          ) : (
            <div className="leading-relaxed whitespace-pre-wrap">
              {parts.map((part, idx) => {
                if (part.added) {
                  return (
                    <span
                      key={idx}
                      className="rounded-[var(--radius-sm)] bg-[color:var(--color-success)]/15 px-1 py-0.5 text-[color:var(--color-success)]"
                    >
                      {part.value}
                    </span>
                  );
                } else if (part.removed) {
                  return (
                    <span
                      key={idx}
                      className="rounded-[var(--radius-sm)] bg-[color:var(--color-accent)]/15 px-1 py-0.5 text-[color:var(--color-accent)] line-through"
                    >
                      {part.value}
                    </span>
                  );
                } else {
                  return <span key={idx}>{part.value}</span>;
                }
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>{/* Empty space for error/hint like in PromptEditor */}</div>

        {/* Diff statistics - positioned like word count */}
        <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted-foreground)]">
          {hasChanges ? (
            <>
              {addedCount > 0 && (
                <div className="flex items-center gap-1 text-[color:var(--color-success)]">
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
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>+{addedCount} additions</span>
                </div>
              )}
              {removedCount > 0 && (
                <div className="flex items-center gap-1 text-[color:var(--color-accent)]">
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
                    <path d="M5 12h14" />
                  </svg>
                  <span>-{removedCount} deletions</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1">
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
              <span>No changes detected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
