import React from 'react';
import MobileHeader from '../MobileHeader';

const MobileLayout = ({ 
  title, 
  children, 
  showOnMobile = true, 
  showOnDesktop = false,
  className = "",
  variant = "default" // "default" or "transaction"
}) => {
  // Responsive visibility classes
  const responsiveClasses = `
    ${showOnMobile ? 'block' : 'hidden'} 
    ${showOnDesktop ? 'lg:block' : 'lg:hidden'}
  `.trim();

  // Don't render if neither mobile nor desktop is enabled
  if (!showOnMobile && !showOnDesktop) {
    return null;
  }

  // Transaction variant preserves the original mobile transaction UI
  if (variant === "transaction") {
    return (
      <main className={`flex flex-col w-full h-[100vh] overflow-hidden ${responsiveClasses} ${className}`}>
        <MobileHeader title={title} />
        <section className="flex-1 bg-primary overflow-y-auto rounded-t-[2.5rem] mt-5 sm:px-6 py-6 sm:py-8 min-h-0">
          {children}
        </section>
      </main>
    );
  }

  // Default variant (for payment pages)
  return (
    <div className={`min-h-screen bg-white overflow-hidden ${responsiveClasses} ${className}`}>
      {/* White Header */}
      <MobileHeader title={title} />
      
      {/* Red Background Container with Rounded Top Corners */}
      <main className="bg-primary text-white rounded-t-3xl min-h-[calc(100vh-80px)] px-6 pt-8 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
