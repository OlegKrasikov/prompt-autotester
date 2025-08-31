import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  className?: string;
}

export function ResponsiveContainer({
  children,
  size = 'full',
  className = '',
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-[640px]',
    md: 'max-w-[768px]',
    lg: 'max-w-[1024px]',
    xl: 'max-w-[1248px]', // 1280px - 32px padding
    '2xl': 'max-w-[1408px]', // 1440px - 32px padding
    '3xl': 'max-w-[1856px]', // 1920px - 64px padding
    '4xl': 'max-w-[2496px]', // 2560px - 64px padding
    full: 'max-w-none',
  };

  return (
    <div className={`3xl:px-16 mx-auto px-4 sm:px-6 xl:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}
