import React from 'react';
import Payment from './Payment';
import { withPaymentLayout } from '../../components/layout/PaymentLayoutWrapper';

const PaymentWithLayout = withPaymentLayout(Payment, {
  title: "Share Payment",
  showOnMobile: true,
  showOnDesktop: false
});

export default PaymentWithLayout;
