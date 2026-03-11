import type { HTMLAttributes } from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', className = '', ...rest }: SpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-primary/20 border-t-primary animate-spin inline-block ${className}`}
      {...rest}
    />
  );
}

