"use client";

import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = "default", 
  padding = "md", 
  hover = false 
}) => {
  const baseClasses = "bg-[color:var(--color-surface)] rounded-[var(--radius-md)] transition-all duration-200";
  
  const variantClasses = {
    default: "border border-[color:var(--color-border)]",
    elevated: "shadow-[var(--shadow-md)] border border-[color:var(--color-border)]",
    outlined: "border-2 border-[color:var(--color-border-strong)]"
  };
  
  const paddingClasses = {
    none: "",
    sm: "p-3 xl:p-4 2xl:p-5 3xl:p-6 4xl:p-8",
    md: "p-4 xl:p-5 2xl:p-6 3xl:p-8 4xl:p-10",
    lg: "p-6 xl:p-7 2xl:p-8 3xl:p-10 4xl:p-12"
  };
  
  const hoverClasses = hover 
    ? "hover:shadow-[var(--shadow-lg)] hover:border-[color:var(--color-accent)]/20 cursor-pointer"
    : "";
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Card sub-components for common patterns
const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className, onClick }) => (
  <div 
    className={`pb-3 border-b border-[color:var(--color-divider)] ${className || ""}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardTitle: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <h3 className={`text-lg xl:text-xl 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl font-semibold text-[color:var(--color-foreground)] ${className || ""}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <p className={`text-sm text-[color:var(--color-muted-foreground)] ${className || ""}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}> = ({ children, className, padding = "md" }) => {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "pt-3",
    lg: "p-6"
  };
  
  return (
    <div className={`${paddingClasses[padding]} ${className || ""}`}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={`pt-3 border-t border-[color:var(--color-divider)] ${className || ""}`}>
    {children}
  </div>
);

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};