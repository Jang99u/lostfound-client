import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="mt-6 flex justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
