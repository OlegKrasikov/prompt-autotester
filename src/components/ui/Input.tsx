"use client";

import React from "react";

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
    
    const baseClasses = "w-full h-10 px-3 text-sm xl:h-11 xl:px-4 xl:text-base 2xl:h-12 2xl:px-5 2xl:text-lg 3xl:h-14 3xl:px-6 3xl:text-xl 4xl:h-16 4xl:px-8 4xl:text-2xl bg-[color:var(--color-surface)] border rounded-[var(--radius)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 placeholder:text-[color:var(--color-muted-foreground)] placeholder:text-sm xl:placeholder:text-base 2xl:placeholder:text-lg 3xl:placeholder:text-xl 4xl:placeholder:text-2xl";
    
    const stateClasses = hasError
      ? "border-[color:var(--color-danger)] focus:ring-[color:var(--color-danger)]/50 focus:border-[color:var(--color-danger)]"
      : "border-[color:var(--color-border)] focus:ring-[color:var(--color-accent)]/50 focus:border-[color:var(--color-accent)]";
    
    const paddingClasses = leftIcon && rightIcon 
      ? "pl-10 pr-10 xl:pl-12 xl:pr-12 2xl:pl-14 2xl:pr-14 3xl:pl-16 3xl:pr-16 4xl:pl-20 4xl:pr-20"
      : leftIcon 
      ? "pl-10 xl:pl-12 2xl:pl-14 3xl:pl-16 4xl:pl-20"
      : rightIcon 
      ? "pr-10 xl:pr-12 2xl:pr-14 3xl:pr-16 4xl:pr-20"
      : "";
    
    const classes = [
      baseClasses,
      stateClasses,
      paddingClasses,
      className
    ].filter(Boolean).join(" ");

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-xs xl:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl font-medium text-[color:var(--color-foreground)] mb-2 xl:mb-3 2xl:mb-3 3xl:mb-4 4xl:mb-5 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 xl:left-4 2xl:left-5 3xl:left-6 4xl:left-8 top-1/2 transform -translate-y-1/2 text-[color:var(--color-muted-foreground)] w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            className={classes}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 xl:right-4 2xl:right-5 3xl:right-6 4xl:right-8 top-1/2 transform -translate-y-1/2 text-[color:var(--color-muted-foreground)] w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 3xl:w-7 3xl:h-7 4xl:w-8 4xl:h-8 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 xl:mt-2 2xl:mt-2 3xl:mt-3 4xl:mt-4 text-xs xl:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl text-[color:var(--color-danger)]">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 xl:mt-2 2xl:mt-2 3xl:mt-3 4xl:mt-4 text-xs xl:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl text-[color:var(--color-muted-foreground)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };