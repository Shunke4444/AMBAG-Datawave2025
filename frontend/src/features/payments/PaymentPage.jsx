import { useTheme, useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import SelectGoalModal from './SelectGoalModal';
import MobileLayout from './PaymentLayout';
import PaymentHeader from './PaymentHeader';
import RemainingShareCard from './RemainingShareCard';
import PaymentAmountDisplay from './PaymentAmountDisplay';
import NumberPad from './NumberPad';
import PaymentButton from './PaymentButton';

import { usePaymentAmount } from '../../hooks/usePaymentAmount';
import { getMyVirtualBalance, listGoals, getMemberQuota } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from "firebase/auth";

function PaymentPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Get goalId from URL params
  const { goalId } = useParams();
  const [showGoalModal, setShowGoalModal] = useState(!goalId);

  // Show modal if no goalId
  if (!goalId) {
    return <SelectGoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} />;
  }

  // Virtual balance state
  const [availableBalance, setAvailableBalance] = useState(0);
  const [availableBalanceDisplay, setAvailableBalanceDisplay] = useState('P0');
  // State for real goal data
  const [goalName, setGoalName] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [quotaLoading, setQuotaLoading] = useState(true);

  // Fetch goal data by goalId and assigned quota for this user
  useEffect(() => {
    async function fetchGoalAndQuota() {
      try {
        // listGoals returns all goals for the group, so find the one with goalId
        const allGoals = await listGoals();
        const goal = allGoals.find(g => String(g.goal_id) === String(goalId));
        if (goal) {
          setGoalName(goal.title || '');
        }
        // Fetch assigned quota for this user for this goal (from SplitBill allocation)
        const user = getAuth().currentUser;
        if (user && goalId) {
          setQuotaLoading(true);
          // Try to get quota from backend allocation (SplitBill)
          const quotaRes = await getMemberQuota({ goal_id: goalId, user_id: user.uid });
          setRemainingAmount(Number(quotaRes?.quota || 0));
        } else {
          setRemainingAmount(0);
        }
      } catch (e) {
        setGoalName('');
        setRemainingAmount(0);
      } finally {
        setQuotaLoading(false);
      }
    }
    fetchGoalAndQuota();
  }, [goalId]);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const balance = await getMyVirtualBalance();
        // Use total_balance from backend response
        const bal = typeof balance === 'number' ? balance : (balance?.total_balance || 0);
        setAvailableBalance(bal);
        setAvailableBalanceDisplay(`P${bal.toLocaleString()}`);
      } catch (e) {
        setAvailableBalance(0);
        setAvailableBalanceDisplay('P0');
      }
    }
    fetchBalance();
  }, []);


  const {
    amount,
    formattedAmount,
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot
  } = usePaymentAmount(availableBalance, remainingAmount);

  // Payment handler: navigate to confirm page with payment data
  const handlePayment = () => {
    // Only allow navigation if amount is valid
    const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    if (numericAmount < 1) return;
  navigate('/payment/confirm', {
      state: {
        amount: amount,
        goalName: goalName,
        availableBalance: availableBalance,
        remainingAmount: remainingAmount,
        goalId: goalId
      }
    });
  };

  const desktopLayout = (
    <div className="min-h-screen bg-secondary overflow-hidden">
      {/* Add shake animation styles and disable scrolling */}
      <style>{`
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
              goalName={goalName}
              remainingAmount={`P${remainingAmount.toLocaleString()}`}
              variant="desktop"
            />

            <PaymentAmountDisplay 
              amount={formattedAmount}
              availableBalance={availableBalanceDisplay}
              variant="desktop"
            />

            <PaymentButton 
              amount={amount}
              availableBalance={availableBalance}
              variant="desktop"
              goalName="House Bills"
              onClick={handlePayment}
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
    <MobileLayout title="Mobile Payment">
      {/* Add shake animation styles and disable scrolling */}
      <style>{`
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
        goalName={goalName}
        remainingAmount={`P${remainingAmount.toLocaleString()}`}
        variant="mobile"
      />

      <PaymentAmountDisplay 
        amount={formattedAmount}
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
          onClick={handlePayment}
        >
          Next
        </PaymentButton>
      </div>
    </MobileLayout>
  );

  return isMobile ? mobileLayout : desktopLayout;
}

export default PaymentPage;