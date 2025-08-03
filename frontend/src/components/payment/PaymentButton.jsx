import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentButton({ 
  amount = '0',
  availableBalance = 8000,
  disabled = false, 
  children, 
  variant = 'desktop',
  goalName = 'House Bills'
}) {
  const navigate = useNavigate();
  const isDesktop = variant === 'desktop';

  // Parse the amount to check if it's valid for navigation
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const isAmountZero = numericAmount === 0;
  const isOverBalance = numericAmount > availableBalance;
  
  // Button should be disabled if amount is 0, over balance, or explicitly disabled
  const isButtonDisabled = disabled || isAmountZero || isOverBalance;

  const handleClick = () => {
    if (!isButtonDisabled && numericAmount >= 1) {
      // Navigate to confirm payment page with the payment data
      navigate('/payment/confirm', { 
        state: { 
          amount: amount,
          goalName: goalName,
          availableBalance: availableBalance
        } 
      });
    }
  };

  const baseClasses = "w-full py-4 font-semibold transition-colors";
  const enabledClasses = isDesktop 
    ? "bg-accent text-textcolor hover:bg-accent/90 rounded-xl text-xl shadow-md"
    : "bg-accent text-black hover:bg-accent/90 rounded-full text-lg";
  const disabledClasses = isDesktop
    ? "bg-gray-300 text-gray-500 cursor-not-allowed rounded-xl text-xl shadow-md"
    : "bg-gray-500 text-gray-300 cursor-not-allowed rounded-full text-lg";

  const getAriaLabel = () => {
    if (isAmountZero) return "Enter an amount to continue";
    if (isOverBalance) return "Amount exceeds available balance";
    if (disabled) return "Payment disabled";
    return "Continue to confirm payment";
  };

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`${baseClasses} ${isButtonDisabled ? disabledClasses : enabledClasses}`}
      aria-label={getAriaLabel()}
    >
      {children}
    </button>
  );
}
