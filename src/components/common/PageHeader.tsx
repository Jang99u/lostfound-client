import React from 'react';
import Breadcrumb from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumb = true,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        {breadcrumb && (
          <div className="mb-4">
            <Breadcrumb />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {children && (
            <div className="flex items-center space-x-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;