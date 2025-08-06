import React from 'react';
import PaymentLayout from '../../components/layout/PaymentLayout';
import { useMobilePaymentLayout } from '../../components/layout/PaymentLayoutWrapper';

const ConditionalPaymentLayout = ({ 
  title, 
  children, 
  mobileComponent, 
  desktopComponent,
  enableMobileLayout = true 
}) => {
  const isMobile = useMobilePaymentLayout();

  // If mobile layout is enabled and we're on mobile
  if (enableMobileLayout && isMobile) {
    return (
      <PaymentLayout title={title} showOnMobile={true} showOnDesktop={false}>
        {mobileComponent || children}
      </PaymentLayout>
    );
  }

  // Desktop or fallback layout
  return desktopComponent || children;
};

export default ConditionalPaymentLayout;
