import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    className, 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    const variantClasses = {
      default: 'border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
      filled: 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-blue-500 focus:bg-white',
      outlined: 'border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500',
    };
    
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    
    const inputClasses = cn(
      baseClasses,
      variantClasses[variant],
      errorClasses,
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;