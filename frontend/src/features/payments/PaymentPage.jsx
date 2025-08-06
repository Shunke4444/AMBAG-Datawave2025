import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileLayout from './PaymentLayout';
import PaymentHeader from './PaymentHeader';
import RemainingShareCard from './RemainingShareCard';
import PaymentAmountDisplay from './PaymentAmountDisplay';
import NumberPad from './NumberPad';
import PaymentButton from './PaymentButton';
import { usePaymentAmount } from '../../hooks/usePaymentAmount';

export default function Payment() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const availableBalance = 8000;
  const availableBalanceDisplay = 'P8000';
  const remainingAmount = 6000;

  const {
    amount,
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot
  } = usePaymentAmount(availableBalance, remainingAmount);

  const desktopLayout = (
    <div className="min-h-screen bg-secondary overflow-hidden">
      {/* Add shake animation styles and disable scrolling */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
        }
        #root {
          overflow: hidden !important;
          height: 100vh !important;
        }
      `}</style>
      
      <PaymentHeader title="Share Payment" />

      {/* Desktop Content */}
      <main className="max-w-4xl mx-auto p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Payment Form */}
          <section className="bg-white rounded-2xl p-8 shadow-lg">
            <RemainingShareCard 
              goalName="House Bills"
              remainingAmount={`P${remainingAmount}`}
              variant="desktop"
            />

            <PaymentAmountDisplay 
              amount={amount}
              availableBalance={availableBalanceDisplay}
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

  const mobileLayout = (
    <MobileLayout title="Share Payment">
      {/* Add shake animation styles and disable scrolling */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        html, body {
          overflow: hidden;
        }
      `}</style>

      <RemainingShareCard 
        goalName="House Bills"
        remainingAmount={`P${remainingAmount}`}
        variant="mobile"
      />

      <PaymentAmountDisplay 
        amount={amount}
        availableBalance={availableBalanceDisplay}
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

  return isMobile ? mobileLayout : desktopLayout;
}