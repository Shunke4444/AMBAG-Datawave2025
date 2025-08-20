
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
import { contributeToGoal, getMyVirtualBalance } from '../../lib/api';
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";

function PaymentPage() {
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
  // TODO: Replace with real remainingAmount from context or props
  const remainingAmount = 6000;

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
    shouldShake,
    handleNumberPress,
    handleDelete,
    handleDot
  } = usePaymentAmount(availableBalance, remainingAmount);

  // Payment handler
  const handlePayment = async () => {
    try {
      // Get contributor_name from Firebase Auth
      const user = getAuth().currentUser;
      if (!user) throw new Error("Not authenticated");
      const contributor_name = user.displayName || user.email || "Unknown User";
      if (!goalId) throw new Error("Goal ID not provided");
      await contributeToGoal(goalId, {
        amount: parseFloat(amount),
        contributor_name,
        payment_method: "cash",
        reference_number: ""
      });
      alert("Payment sent!");
    } catch (err) {
      alert("Payment failed: " + (err?.message || err));
    }
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