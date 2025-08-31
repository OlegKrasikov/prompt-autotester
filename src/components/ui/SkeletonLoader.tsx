'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-[color:var(--color-surface-2)]';

  const variantClasses = {
    text: 'rounded-[var(--radius-sm)] h-4',
    rect: 'rounded-[var(--radius)]',
    circle: 'rounded-full',
  };

  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={classes}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={classes} style={style} />;
};

// Preset skeleton components for common use cases
const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 ${className || ''}`}
  >
    <Skeleton variant="rect" height={120} className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" width="60%" />
  </div>
);

const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className,
}) => (
  <div
    className={`overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] ${className || ''}`}
  >
    {/* Header */}
    <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-1)] p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} variant="text" height={16} />
        ))}
      </div>
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="border-b border-[color:var(--color-border)] p-4 last:border-b-0"
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={16} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => <Skeleton variant="circle" width={size} height={size} className={className} />;

const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton
    variant="rect"
    height={40}
    width={120}
    className={`rounded-[var(--radius)] ${className || ''}`}
  />
);

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonButton };
