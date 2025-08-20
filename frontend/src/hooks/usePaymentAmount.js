
import { useState, useCallback } from 'react';

// Store amount as a plain string (no formatting)
export function usePaymentAmount(availableBalance = 8000, remainingAmount = 6000) {
  const [amount, setAmount] = useState('0');
  const [shouldShake, setShouldShake] = useState(false);

  const handleNumberPress = useCallback((number) => {
    let newAmount;
    if (amount === '0') {
      newAmount = number.toString();
    } else {
      newAmount = amount + number.toString();
    }
    setAmount(newAmount);
  }, [amount]);

  const handleDelete = useCallback(() => {
    let newAmount;
    if (amount.length <= 1) {
      newAmount = '0';
    } else {
      newAmount = amount.slice(0, -1);
    }
    setAmount(newAmount);
  }, [amount]);

  const handleDot = useCallback(() => {
    if (!amount.includes('.')) {
      setAmount(amount + '.');
    }
  }, [amount]);

  // For display only: format with commas
  const formattedAmount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return {
    amount, // plain string for backend
    formattedAmount, // for display
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot,
    setAmount
  };
}