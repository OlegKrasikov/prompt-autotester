'use client';

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    const baseClasses =
      'w-full h-10 px-3 text-sm xl:h-11 xl:px-4 xl:text-base 2xl:h-12 2xl:px-5 2xl:text-lg 3xl:h-14 3xl:px-6 3xl:text-xl 4xl:h-16 4xl:px-8 4xl:text-2xl bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-[color:var(--color-muted-foreground)] placeholder:text-sm xl:placeholder:text-base 2xl:placeholder:text-lg 3xl:placeholder:text-xl 4xl:placeholder:text-2xl';

    const stateClasses = hasError
      ? 'border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]'
      : 'border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]';

    const paddingClasses =
      leftIcon && rightIcon
        ? 'pl-10 pr-10 xl:pl-12 xl:pr-12 2xl:pl-14 2xl:pr-14 3xl:pl-16 3xl:pr-16 4xl:pl-20 4xl:pr-20'
        : leftIcon
          ? 'pl-10 xl:pl-12 2xl:pl-14 3xl:pl-16 4xl:pl-20'
          : rightIcon
            ? 'pr-10 xl:pr-12 2xl:pr-14 3xl:pr-16 4xl:pr-20'
            : '';

    const classes = [baseClasses, stateClasses, paddingClasses, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="3xl:text-lg 4xl:text-xl 3xl:mb-4 4xl:mb-5 mb-2 block text-xs font-medium tracking-wide text-[color:var(--color-foreground)] uppercase xl:mb-3 xl:text-sm 2xl:mb-3 2xl:text-base"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="3xl:left-6 4xl:left-8 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 absolute top-1/2 left-3 flex h-4 w-4 -translate-y-1/2 transform items-center justify-center text-[color:var(--color-muted-foreground)] xl:left-4 xl:h-5 xl:w-5 2xl:left-5 2xl:h-6 2xl:w-6">
              {leftIcon}
            </div>
          )}
          <input id={inputId} className={classes} ref={ref} {...props} />
          {rightIcon && (
            <div className="3xl:right-6 4xl:right-8 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 absolute top-1/2 right-3 flex h-4 w-4 -translate-y-1/2 transform items-center justify-center text-[color:var(--color-muted-foreground)] xl:right-4 xl:h-5 xl:w-5 2xl:right-5 2xl:h-6 2xl:w-6">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export { Input };
