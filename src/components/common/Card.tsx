import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = ({ children, className = '', hover = false, padding = 'md' }: CardProps) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm';
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-1 transition-all duration-200' : '';
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
