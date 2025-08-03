import React from 'react';

export default function PaymentAmountDisplay({ 
  amount, 
  availableBalance, 
  isExceeded, 
  variant = 'desktop' 
}) {
  const isDesktop = variant === 'desktop';

  if (isDesktop) {
    return (
      <div className="text-center mb-8">
        <div className={`text-6xl font-bold mb-4 transition-colors ${
          isExceeded ? 'text-red-500' : 'text-primary'
        }`}>
          P{amount}
        </div>
        <div className="text-textcolor/70 text-lg">
          Available Balance: {availableBalance}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <div className={`text-5xl font-bold mb-2 transition-colors ${
        isExceeded ? 'text-red-400' : 'text-white'
      }`}>
        P{amount}
      </div>
      <div className="text-white/70 text-sm">
        Available Balance: {availableBalance}
      </div>
    </div>
  );
}
