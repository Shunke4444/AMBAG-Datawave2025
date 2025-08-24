
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import MobileLayout from './PaymentLayout';

export default function Receipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Get payment data from navigation state or use default values
  const paymentStateData = location.state || {};
  // Use MembersContext to get user's name (same as welcome message)
  const [memberName, setMemberName] = useState("Unknown User");
  useEffect(() => {
    async function fetchName() {
      try {
        const user = getAuth().currentUser;
        if (user) {
          const token = await user.getIdToken();
          const res = await api.get(`/users/profile/${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const profile = res?.data?.profile || {};
          const firstName = profile?.first_name || "";
          const lastName = profile?.last_name || "";
          if (firstName || lastName) {
            setMemberName(`${firstName} ${lastName}`.trim());
          } else if (profile?.name) {
            setMemberName(profile.name);
          } else if (profile?.email) {
            setMemberName(profile.email);
          }
        }
      } catch {
        setMemberName("Unknown User");
      }
    }
    fetchName();
  }, []);
  // Calculate remaining balance
  const amountSent = paymentStateData.amount || '';
  const availableBalance = paymentStateData.availableBalance || 0;
  const numericAmount = parseFloat(String(amountSent).replace(/[^\d.]/g, '')) || 0;
  const remainingBalance = `P${(availableBalance - numericAmount).toLocaleString()}`;
  const receiptData = {
    transactionId: paymentStateData.transactionId || '0237-7746-8981-9028-5626',
    memberName,
    amountSent,
    remainingBalance,
    goalName: paymentStateData.goalName || 'House Bills',
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    }),
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };

  
  const handleGoHome = () => {
    if (isMobile) {
  navigate("/app/dashboard"); // mobile route
    } else {
  navigate("/app/dashboard"); // desktop route
    }
  };
  const desktopLayout = (
    <div className="min-h-screen bg-secondary overflow-hidden">
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

      {/* Desktop Header */}
      <header className="bg-white shadow-sm border-b p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center relative">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <ArrowBack />
          </button>
          <h1 className="text-2xl font-bold text-textcolor">AMBAG Confirmed</h1>
        </div>
      </header>

      {/* Desktop Content */}
      <main className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <section className="bg-primary rounded-2xl p-8 text-white w-full max-w-md">
          {/* Success Icon */}
          <figure className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-textcolor" />
            </div>
          </figure>

          {/* Receipt */}
          <article className="bg-white text-textcolor rounded-lg p-6 mb-8">
            {/* Date and Time */}
            <time className="block text-center text-sm text-textcolor/70 mb-4">
              {receiptData.date} • {receiptData.time}
            </time>

            {/* Transaction ID */}
            <div className="border-2 border-dashed border-textcolor/30 rounded-lg p-3 mb-4 text-center">
              <h2 className="text-xs text-textcolor/60 mb-1">Transaction ID</h2>
              <p className="font-mono text-sm font-medium">{receiptData.transactionId}</p>
            </div>

            {/* Receipt Details */}
            <dl className="space-y-3 mb-6">
              <div className="flex justify-between">
                <dt className="text-textcolor/70">Member Name</dt>
                <dd className="font-medium">{receiptData.memberName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-textcolor/70">Amount Sent</dt>
                <dd className="font-medium">{receiptData.amountSent}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-textcolor/70">Remaining Balance</dt>
                <dd className="font-medium">{receiptData.remainingBalance}</dd>
              </div>
            </dl>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-accent">AMBAG</h1>
            </div>

            {/* Decorative bottom edge */}
            <div className="mt-6 -mb-6 -mx-6">
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="w-3 h-3 bg-white transform rotate-45 -mb-2"></div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Go Home Button */}
          <button
            onClick={handleGoHome}
            className="w-full py-4 rounded-full text-lg font-semibold bg-accent text-textcolor hover:bg-accent/90 transition-colors"
          >
            Return to Home
          </button>
        </section>
      </main>
    </div>
  );    

  const mobileLayout = (
    <MobileLayout title="AMBAG Confirmed">
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

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {/* Success Icon */}
        <figure className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center">
            <CheckCircle fontSize='' className="text-[4rem] text-textcolor" />
          </div>
        </figure>

        {/* Receipt */}
        <article className="bg-white text-textcolor rounded-lg p-6 mb-8 w-full max-w-sm mx-4">
          {/* Date and Time */}
          <time className="block text-center text-sm text-textcolor/70 mb-4">
            {receiptData.date} • {receiptData.time}
          </time>

          {/* Transaction ID */}
          <div className="border-2 border-dashed border-textcolor/30 rounded-lg p-3 mb-4 text-center">
            <h2 className="text-xs text-textcolor/60 mb-1">Transaction ID</h2>
            <p className="font-mono text-xs font-medium break-all">{receiptData.transactionId}</p>
          </div>

          {/* Receipt Details */}
          <dl className="space-y-3 mb-6">
            <div className="flex justify-between">
              <dt className="text-textcolor/70 text-sm">Member Name</dt>
              <dd className="font-medium text-sm">{receiptData.memberName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-textcolor/70 text-sm">Amount Sent</dt>
              <dd className="font-medium text-sm">{receiptData.amountSent}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-textcolor/70 text-sm">Remaining Balance</dt>
              <dd className="font-medium text-sm">{receiptData.remainingBalance}</dd>
            </div>
          </dl>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-accent">AMBAG</h1>
          </div>

          {/* Decorative bottom edge */}
          <div className="mt-6 -mb-6 -mx-6">
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: 15 }, (_, i) => (
                  <div key={i} className="w-2 h-2 bg-white transform rotate-45 -mb-1"></div>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Go Home Button */}
        <button
          onClick={handleGoHome}
          className="w-full max-w-sm mx-4 py-4 rounded-full text-lg font-semibold bg-accent text-textcolor hover:bg-accent/90 transition-colors"
        >
          Return to Home
        </button>
      </main>
    </MobileLayout>
  );

  return isMobile ? mobileLayout : desktopLayout;
}