import React, { useState } from 'react';
import { contributeToGoal } from '../../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileLayout from './PaymentLayout';
import StopIcon from '../../assets/icons/StopIcon.svg';

export default function ConfirmPay() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [isChecked, setIsChecked] = useState(false);

  const paymentStateData = location.state || {};
  const paymentData = {
    remainingBalance: paymentStateData.remainingBalance,
    amountToSend: paymentStateData.amount ?? paymentStateData.amountToSend,
    totalAmount: paymentStateData.totalAmount ?? paymentStateData.amount ?? paymentStateData.amountToSend,
    goalName: paymentStateData.goalName,
    availableBalance: paymentStateData.availableBalance
  };

  // Check if payment amount exceeds available balance
  const amountNumeric = parseFloat(paymentData.amountToSend.replace(/[P,]/g, '')) || 0;
  const isExceeded = amountNumeric > paymentData.availableBalance;

  const handleSendPayment = async () => {
    try {
      // Call backend to contribute to goal
      // Try to get goalId from state or paymentStateData
      const goalId = paymentStateData.goalId || paymentStateData.goal_id || paymentStateData.goalID || paymentStateData.goal_id;
      if (!goalId) throw new Error('Missing goalId');
      // Use current user as contributor_name if not provided
      const user = window?.firebase?.auth?.()?.currentUser;
      let contributor_name = paymentStateData.memberName || (user ? user.displayName || user.email || user.uid : '');
      if (!contributor_name) contributor_name = 'Anonymous';
      // Remove currency symbol and commas
      const amount = String(paymentData.amountToSend).replace(/[^\d.]/g, '');
      await contributeToGoal(goalId, {
        amount,
        contributor_name,
        payment_method: 'virtual_balance',
        reference_number: ''
      });
      // Navigate to receipt page with payment data
  navigate('/app/receipt', {
        state: {
          amount: paymentData.amountToSend,
          goalName: paymentData.goalName,
          memberName: contributor_name,
          timestamp: new Date().toISOString(),
          transactionId: generateTransactionId(),
          remainingBalance: calculateRemainingBalance(),
          ...paymentStateData
        }
      });
    } catch (err) {
      alert('Payment failed: ' + (err?.message || err));
    }
  };

  // Helper function to generate transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp.slice(-4)}-${random.slice(0, 4)}-${random.slice(4, 8)}-${timestamp.slice(-8, -4)}-${random.slice(-4)}`.toUpperCase();
  };

  // Helper function to calculate remaining balance
  const calculateRemainingBalance = () => {
    const currentBalance = paymentData.availableBalance;
    const amountToSend = parseInt(paymentData.amountToSend.replace('P', ''));
    const remaining = currentBalance - amountToSend;
    return `P${remaining}`;
  };

  const desktopLayout = (
    <div className="min-h-screen bg-secondary overflow-hidden">
      {/* Global styles to disable scrolling */}
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
        }
        #root {
          overflow: hidden !important;
          height: 100vh !important;
        }
      `}</style>
      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-textcolor">Confirm Payment</h1>
        </div>
      </header>

      {/* Desktop Content */}
      <main className="max-w-2xl mx-auto p-6">
        <section className="bg-primary rounded-2xl p-8 text-white">
          {/* Stop Icon */}
          <figure className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-accent flex items-center justify-center">
              <img 
                src={StopIcon} 
                alt="Stop" 
                className="w-16 h-16" 
                style={{filter: 'brightness(0) saturate(100%) invert(84%) sepia(78%) saturate(475%) hue-rotate(8deg) brightness(98%) contrast(96%)'}}
              />
            </div>
          </figure>

          {/* Payment Details */}
          <section className="space-y-4 mb-8">
            <dl className="flex justify-between items-center">
              <dt className="text-white/80">Remaining Balance</dt>
              <dd className="font-semibold">{paymentData.remainingBalance}</dd>
            </dl>
            <dl className="flex justify-between items-center">
              <dt className="text-white/80">Amount to send</dt>
              <dd className={`font-semibold ${isExceeded ? 'text-red-500' : ''}`}>{paymentData.amountToSend}</dd>
            </dl>
            <div className="border-t border-white/20 pt-4">
              <dl className="flex justify-between items-center">
                <dt className="text-xl font-bold">Total Amount to Pay</dt>
                <dd className={`text-xl font-bold ${isExceeded ? 'text-red-500' : ''}`}>{paymentData.totalAmount}</dd>
              </dl>
            </div>
          </section>

          {/* Description */}
          <article className="bg-white/10 rounded-lg p-4 mb-8">
            <p className="text-white/90 text-center leading-relaxed">
              This transaction is used to pay for "{paymentData.goalName}". Every payment will go towards the group pool and will be handled by your manager.
            </p>
          </article>

          {/* Warning for exceeding available balance */}
          {isExceeded && (
            <article className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-white">
                  <h4 className="font-semibold text-red-200 mb-1">
                    Payment Exceeds Available Balance
                  </h4>
                  <p className="text-sm text-red-100">
                    Your payment of {paymentData.amountToSend} exceeds your available balance of P{paymentData.availableBalance}. This will result in an overpayment.
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* Checkbox */}
          <div className="flex items-start gap-3 mb-8">
            <input
              type="checkbox"
              id="confirm-checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 mt-1 accent-accent"
            />
            <label htmlFor="confirm-checkbox" className="text-white/90 text-sm leading-relaxed">
              {isExceeded 
                ? "I understand I am overpaying and confirm this payment."
                : "I confirm that I am paying my share."
              }
            </label>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendPayment}
            disabled={!isChecked}
            className={`w-full py-4 rounded-full text-lg font-semibold transition-colors ${
              isChecked
                ? 'bg-accent text-black hover:bg-accent/90' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Send {paymentData.totalAmount}
          </button>
        </section>
      </main>
    </div>
  );

  const mobileLayout = (
    <MobileLayout title="Confirm Payment">
      {/* Global styles to disable scrolling */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
        }
        #root {
          overflow: hidden !important;
          height: 100vh !important;
        }
      `}</style>
      {/* Stop Icon */}
      <figure className="flex justify-center mb-8">
        <div className=" flex items-center justify-center">
          <img 
            src={StopIcon} 
            alt="Stop" 
            className="w-48 h-48" 
            style={{filter: 'brightness(0) saturate(100%) invert(84%) sepia(78%) saturate(475%) hue-rotate(8deg) brightness(98%) contrast(96%)'}}
          />
        </div>
      </figure>

      {/* Payment Details */}
      <section className="space-y-4 mb-8">
        <dl className="flex justify-between items-center text-white">
          <dt className="text-white/80">Remaining Balance</dt>
          <dd className="font-semibold">{paymentData.remainingBalance}</dd>
        </dl>
        <dl className="flex justify-between items-center text-white">
          <dt className="text-white/80">Amount to send</dt>
          <dd className={`font-semibold ${isExceeded ? 'text-red-500' : ''}`}>{paymentData.amountToSend}</dd>
        </dl>
        <div className="border-t border-white/20 pt-4">
          <dl className="flex justify-between items-center text-white">
            <dt className="text-lg font-bold">Total Amount to Pay</dt>
            <dd className={`text-lg font-bold ${isExceeded ? 'text-red-500' : ''}`}>{paymentData.totalAmount}</dd>
          </dl>
        </div>
      </section>

      {/* Description */}
      <article className="bg-white/10 rounded-lg p-4 mb-6">
        <p className="text-white/90 text-center text-sm leading-relaxed">
          This transaction is used to pay for "{paymentData.goalName}". Every payment will go towards the group pool and will be handled by your manager.
        </p>
      </article>

      {/* Warning for exceeding available balance */}
      {isExceeded && (
        <article className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-white">
              <h4 className="font-semibold text-red-200 mb-1 text-sm">
                Payment Exceeds Available Balance
              </h4>
              <p className="text-xs text-red-100">
                Your payment of {paymentData.amountToSend} exceeds your available balance of P{paymentData.availableBalance}. This will result in an overpayment.
              </p>
            </div>
          </div>
        </article>
      )}

      {/* Checkbox */}
      <div className="flex items-start gap-3 mb-8">
        <input
          type="checkbox"
          id="confirm-checkbox-mobile"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-4 h-4 mt-1 accent-accent"
        />
        <label htmlFor="confirm-checkbox-mobile" className="text-white/90 text-sm leading-relaxed">
          {isExceeded 
            ? "I understand I am overpaying and confirm this payment."
            : "I confirm that I am paying my share."
          }
        </label>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendPayment}
        disabled={!isChecked}
        className={`w-full py-4 rounded-full text-lg font-semibold transition-colors ${
          isChecked
            ? 'bg-accent text-black hover:bg-accent/90' 
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        Send {paymentData.totalAmount}
      </button>
    </MobileLayout>
  );

  return isMobile ? mobileLayout : desktopLayout;
}