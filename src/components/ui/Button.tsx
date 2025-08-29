"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
      primary: "bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-hover)] focus:ring-[color:var(--color-accent)]/50 shadow-sm",
      secondary: "bg-[color:var(--color-surface)] border border-[color:var(--color-border-strong)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-1)] focus:ring-[color:var(--color-accent)]/50 shadow-sm",
      danger: "bg-[color:var(--color-danger)] text-white hover:bg-[color:var(--color-danger-hover)] focus:ring-[color:var(--color-danger)]/50 shadow-sm",
      ghost: "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-1)] focus:ring-[color:var(--color-accent)]/50",
      success: "bg-[color:var(--color-success)] text-white hover:bg-[color:var(--color-success-hover)] focus:ring-[color:var(--color-success)]/50 shadow-sm"
    };
    
    const sizeClasses = {
      sm: "h-8 px-3 text-sm xl:h-9 xl:px-4 2xl:h-10 2xl:px-4 3xl:h-11 3xl:px-5 4xl:h-12 4xl:px-6 rounded-[var(--radius-sm)]",
      md: "h-10 px-4 text-sm xl:h-11 xl:px-5 xl:text-base 2xl:h-12 2xl:px-6 2xl:text-lg 3xl:h-14 3xl:px-8 3xl:text-xl 4xl:h-16 4xl:px-10 4xl:text-2xl rounded-[var(--radius)]", 
      lg: "h-12 px-6 text-base xl:h-14 xl:px-7 xl:text-lg 2xl:h-16 2xl:px-8 2xl:text-xl 3xl:h-[4.5rem] 3xl:px-10 3xl:text-2xl 4xl:h-20 4xl:px-12 4xl:text-3xl rounded-[var(--radius-md)]"
    };
    
    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    ].filter(Boolean).join(" ");

    return (
      <button
        className={classes}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg 
            className={`animate-spin mr-2 ${
              size === "sm" ? "w-3 h-3 xl:w-4 xl:h-4" : 
              size === "md" ? "w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6" : 
              "w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 3xl:w-8 3xl:h-8"
            }`}
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };