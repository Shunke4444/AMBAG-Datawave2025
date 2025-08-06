import React from 'react';
import PaymentLayout from './PaymentLayout';

// Higher-order component to wrap pages with PaymentLayout
export const withPaymentLayout = (WrappedComponent, layoutOptions = {}) => {
  const {
    title = "Page Title",
    showOnMobile = true,
    showOnDesktop = false,
    className = ""
  } = layoutOptions;

  return function PaymentLayoutWrapper(props) {
    return (
      <PaymentLayout 
        title={title}
        showOnMobile={showOnMobile}
        showOnDesktop={showOnDesktop}
        className={className}
      >
        <WrappedComponent {...props} />
      </PaymentLayout>
    );
  };
};

// Hook for conditional layout rendering
export const useMobilePaymentLayout = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export default PaymentLayout;
