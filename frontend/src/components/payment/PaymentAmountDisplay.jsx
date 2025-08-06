import React from 'react';

// Reusable Warning Icon Component
const WarningIcon = ({ className = "h-5 w-5" }) => (
  <svg className={`${className} text-red-400`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

// Reusable Warning Message Component
const ExceedsShareWarning = ({ variant = 'desktop' }) => {
  const isDesktop = variant === 'desktop';
  
  if (isDesktop) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <WarningIcon />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Amount Exceeds Your Share
            </h3>
            <p className="mt-1 text-sm text-red-700">
              You are paying more than your required share. By continuing, you agree to overpay your share.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mx-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <WarningIcon />
        </div>
        <div className="text-left">
          <h3 className="text-sm font-semibold text-red-300 mb-1">
            Exceeds Your Share
          </h3>
          <p className="text-xs text-red-200 leading-relaxed">
            You are paying more than your required share. By continuing, you agree to overpay your share.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function PaymentAmountDisplay({ 
  amount, 
  availableBalance, 
  variant = 'desktop' 
}) {
  const isDesktop = variant === 'desktop';

if (isDesktop) {
    return (
      <div className="text-center mb-8">
        <div className="text-6xl font-bold mb-4 transition-colors text-primary">
          P{amount}
        </div>
        <div className="text-textcolor/70 text-lg mb-4">
          Available Balance: {availableBalance}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <div className="text-5xl font-bold mb-2 transition-colors text-white">
        P{amount}
      </div>
      <div className="text-white/70 text-sm mb-4">
        Available Balance: {availableBalance}
      </div>
    </div>
  );
}
