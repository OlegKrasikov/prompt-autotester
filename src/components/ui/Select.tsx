'use client';

import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, placeholder, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);

    const baseClasses =
      'w-full h-10 px-3 text-sm xl:h-11 xl:px-4 xl:text-base 2xl:h-12 2xl:px-5 2xl:text-lg 3xl:h-14 3xl:px-6 3xl:text-xl 4xl:h-16 4xl:px-8 4xl:text-2xl bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer text-[color:var(--color-foreground)] invalid:text-[color:var(--color-muted-foreground)]';

    const stateClasses = hasError
      ? 'border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]'
      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]';

    const classes = [
      baseClasses,
      stateClasses,
      'pr-10 xl:pr-12 2xl:pr-14 3xl:pr-16 4xl:pr-20', // Space for chevron
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="3xl:text-lg 4xl:text-xl 3xl:mb-4 4xl:mb-5 mb-2 block text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase xl:mb-3 xl:text-sm 2xl:mb-3 2xl:text-base"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select id={selectId} className={classes} ref={ref} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <div className="3xl:right-6 4xl:right-8 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform text-[color:var(--color-muted-foreground)] xl:right-4 2xl:right-5">
            <svg
              className="3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="3xl:mt-3 4xl:mt-4 3xl:text-lg 4xl:text-xl mt-1 text-xs text-[color:var(--color-danger)] xl:mt-2 xl:text-sm 2xl:mt-2 2xl:text-base">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="3xl:mt-3 4xl:mt-4 3xl:text-lg 4xl:text-xl mt-1 text-xs text-[color:var(--color-muted-foreground)] xl:mt-2 xl:text-sm 2xl:mt-2 2xl:text-base">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
