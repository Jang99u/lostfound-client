import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', children, className, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
      elevated: 'bg-white shadow-lg hover:shadow-xl',
      outlined: 'bg-white border-2 border-gray-200 hover:border-gray-300',
      filled: 'bg-gray-50 border border-gray-200 hover:bg-gray-100',
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;