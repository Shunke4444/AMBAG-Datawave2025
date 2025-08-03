import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileLayout from '../../components/layout/PaymentLayout';
import PaymentHeader from '../../components/payment/PaymentHeader';
import RemainingShareCard from '../../components/payment/RemainingShareCard';
import PaymentAmountDisplay from '../../components/payment/PaymentAmountDisplay';
import NumberPad from '../../components/payment/NumberPad';
import PaymentButton from '../../components/payment/PaymentButton';
import { usePaymentAmount } from '../../hooks/usePaymentAmount';

export default function Payment() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const availableBalance = 8000;
  const availableBalanceDisplay = 'P8000';
  
  const {
    amount,
    isExceeded,
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot
  } = usePaymentAmount(availableBalance);

  // Desktop Version
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-secondary">
        {/* Add shake animation styles */}
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
            20%, 40%, 60%, 80% { transform: translateX(3px); }
          }
          .shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
        
        <PaymentHeader title="Share Payment" />

        {/* Desktop Content */}
        <main className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Payment Form */}
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <RemainingShareCard 
                goalName="House Bills"
                remainingAmount="P6000"
                isExceeded={isExceeded}
                variant="desktop"
              />

              <PaymentAmountDisplay 
                amount={amount}
                availableBalance={availableBalanceDisplay}
                isExceeded={isExceeded}
                variant="desktop"
              />

              <PaymentButton 
                amount={amount}
                availableBalance={availableBalance}
                variant="desktop"
                goalName="House Bills"
              >
                Continue Payment
              </PaymentButton>
            </section>

            {/* Right Side - Number Pad */}
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-textcolor mb-6 text-center">Enter Amount</h2>
              <NumberPad 
                onNumberPress={handleNumberPress}
                onDelete={handleDelete}
                onDot={handleDot}
                variant="desktop"
              />
            </section>
          </div>
        </main>
      </div>
    );
  }

  // Mobile Version
  return (
    <MobileLayout title="Share Payment">
      {/* Add shake animation styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <RemainingShareCard 
        goalName="House Bills"
        remainingAmount="P6000"
        variant="mobile"
      />

      <PaymentAmountDisplay 
        amount={amount}
        availableBalance={availableBalanceDisplay}
        isExceeded={isExceeded}
        variant="mobile"
      />

      <NumberPad 
        onNumberPress={handleNumberPress}
        onDelete={handleDelete}
        onDot={handleDot}
        variant="mobile"
      />

      <div className="mt-8">
        <PaymentButton 
          amount={amount}
          availableBalance={availableBalance}
          variant="mobile"
          goalName="House Bills"
        >
          Next
        </PaymentButton>
      </div>
    </MobileLayout>
  );
}
