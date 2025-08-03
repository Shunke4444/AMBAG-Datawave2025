import { useState, useCallback } from 'react';

export function usePaymentAmount(availableBalance = 8000) {
  const [amount, setAmount] = useState('0');
  const [isExceeded, setIsExceeded] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  const checkAmountExceeded = useCallback((newAmount) => {
    const numericAmount = parseFloat(newAmount.replace(/,/g, '')) || 0;
    const exceeded = numericAmount > availableBalance;
    setIsExceeded(exceeded);
    
    if (exceeded && !shouldShake) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
    }
  }, [availableBalance, shouldShake]);

  const handleNumberPress = useCallback((number) => {
    let newAmount;
    if (amount === '0' || amount === '4,000') {
      newAmount = number.toString();
    } else {
      const cleanAmount = amount.replace(/,/g, '') + number;
      newAmount = Number(cleanAmount).toLocaleString();
    }
    setAmount(newAmount);
    checkAmountExceeded(newAmount);
  }, [amount, checkAmountExceeded]);

  const handleDelete = useCallback(() => {
    let newAmount;
    if (amount.length <= 1) {
      newAmount = '0';
    } else {
      const cleanAmount = amount.replace(/,/g, '').slice(0, -1);
      newAmount = cleanAmount ? Number(cleanAmount).toLocaleString() : '0';
    }
    setAmount(newAmount);
    checkAmountExceeded(newAmount);
  }, [amount, checkAmountExceeded]);

  const handleDot = useCallback(() => {
    if (!amount.includes('.')) {
      const newAmount = amount + '.';
      setAmount(newAmount);
      checkAmountExceeded(newAmount);
    }
  }, [amount, checkAmountExceeded]);

  return {
    amount,
    isExceeded,
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot,
    setAmount
  };
}
