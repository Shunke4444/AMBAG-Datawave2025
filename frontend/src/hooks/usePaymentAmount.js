import { useState, useCallback } from 'react';

export function usePaymentAmount(availableBalance = 8000, remainingAmount = 6000) {
  const [amount, setAmount] = useState('0');
  const [shouldShake, setShouldShake] = useState(false);

  const handleNumberPress = useCallback((number) => {
    let newAmount;
    if (amount === '0' || amount === '4,000') {
      newAmount = number.toString();
    } else {
      const cleanAmount = amount.replace(/,/g, '') + number;
      newAmount = Number(cleanAmount).toLocaleString();
    }
    setAmount(newAmount);
  }, [amount]);

  const handleDelete = useCallback(() => {
    let newAmount;
    if (amount.length <= 1) {
      newAmount = '0';
    } else {
      const cleanAmount = amount.replace(/,/g, '').slice(0, -1);
      newAmount = cleanAmount ? Number(cleanAmount).toLocaleString() : '0';
    }
    setAmount(newAmount);
  }, [amount]);

  const handleDot = useCallback(() => {
    if (!amount.includes('.') && amount !== '0') {
      const newAmount = amount + '.';
      setAmount(newAmount);
    }
  }, [amount]);

  return {
    amount,
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot,
    setAmount
  };
}