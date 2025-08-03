import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileLayout from '../../components/layout/PaymentLayout';
import StopIcon from '../../assets/icons/StopIcon.svg';

export default function ConfirmPay() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [isChecked, setIsChecked] = useState(false);

  // Sample data - these would come from the previous payment screen
  const paymentData = {
    remainingBalance: 'P6000',
    amountToSend: 'P2000',
    totalAmount: 'P2000'
  };

  const handleSendPayment = () => {
    console.log('Payment sent:', paymentData);
  };

  // Desktop Version
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-secondary">
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
          <div className="bg-primary rounded-2xl p-8 text-white">
            {/* Stop Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-accent flex items-center justify-center">
                <img 
                  src={StopIcon} 
                  alt="Stop" 
                  className="w-12 h-12" 
                  style={{filter: 'brightness(0) saturate(100%) invert(84%) sepia(78%) saturate(475%) hue-rotate(8deg) brightness(98%) contrast(96%)'}}
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Remaining Balance</span>
                <span className="font-semibold">{paymentData.remainingBalance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Amount to send</span>
                <span className="font-semibold">{paymentData.amountToSend}</span>
              </div>
              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total Amount to Pay</span>
                  <span className="text-xl font-bold">{paymentData.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/10 rounded-lg p-4 mb-8">
              <p className="text-white/90 text-center leading-relaxed">
                This transaction is used to pay for "House Bills". Every twill go towards the group pool and will be handled by your manager.
              </p>
            </div>

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
                I confirm that I am paying my share.
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
          </div>
        </main>
      </div>
    );
  }

  // Mobile Version
  return (
    <MobileLayout title="Confirm Payment">
      {/* Stop Icon */}
      <div className="flex justify-center mb-8">
        <div className=" flex items-center justify-center">
          <img 
            src={StopIcon} 
            alt="Stop" 
            className="w-40 h-40" 
            style={{filter: 'brightness(0) saturate(100%) invert(84%) sepia(78%) saturate(475%) hue-rotate(8deg) brightness(98%) contrast(96%)'}}
          />
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-white">
          <span className="text-white/80">Remaining Balance</span>
          <span className="font-semibold">{paymentData.remainingBalance}</span>
        </div>
        <div className="flex justify-between items-center text-white">
          <span className="text-white/80">Amount to send</span>
          <span className="font-semibold">{paymentData.amountToSend}</span>
        </div>
        <div className="border-t border-white/20 pt-4">
          <div className="flex justify-between items-center text-white">
            <span className="text-lg font-bold">Total Amount to Pay</span>
            <span className="text-lg font-bold">{paymentData.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg p-4 mb-6">
        <p className="text-white/90 text-center text-sm leading-relaxed">
          This transaction is used to pay for "House Bills". Every amount will go towards the group pool and will be handled by your manager.
        </p>
      </div>

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
          I confirm that I am paying my share.
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
}
