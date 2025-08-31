'use client';

import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, showCharCount, maxLength, id, value, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = Boolean(error);
    const charCount = typeof value === 'string' ? value.length : 0;

    const baseClasses =
      'w-full px-3 py-2 text-sm bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-[color:var(--color-muted-foreground)] resize-none';

    const stateClasses = hasError
      ? 'border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]'
      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]';

    const classes = [baseClasses, stateClasses, className].filter(Boolean).join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={classes}
          maxLength={maxLength}
          value={value}
          ref={ref}
          {...props}
        />
        <div className="mt-1 flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-[color:var(--color-danger)]">{error}</p>}
            {hint && !error && (
              <p className="text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>
            )}
          </div>
          {showCharCount && (
            <p className="text-xs text-[color:var(--color-muted-foreground)]">
              {charCount}
              {maxLength && `/${maxLength}`}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
