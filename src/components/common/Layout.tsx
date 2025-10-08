import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Layout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  maxWidth = 'xl',
  padding = 'md'
}: LayoutProps) => {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-12',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {showHeader && <Header />}
      
      <main className={`${maxWidthClasses[maxWidth]} mx-auto ${paddingClasses[padding]} flex-1`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;