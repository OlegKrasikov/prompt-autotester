import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols: {
    sm?: number;
    md?: number; 
    lg?: number;
    xl?: number;
    '2xl'?: number;
    '3xl'?: number;
    '4xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols,
  gap = 'md',
  className = '' 
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3 xl:gap-4 2xl:gap-5 3xl:gap-6 4xl:gap-8',
    md: 'gap-4 xl:gap-5 2xl:gap-6 3xl:gap-8 4xl:gap-10',
    lg: 'gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10 4xl:gap-12',
    xl: 'gap-8 xl:gap-9 2xl:gap-10 3xl:gap-12 4xl:gap-16'
  };

  const colClasses = [
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`, 
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
    cols['3xl'] && `3xl:grid-cols-${cols['3xl']}`,
    cols['4xl'] && `4xl:grid-cols-${cols['4xl']}`
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid ${colClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}