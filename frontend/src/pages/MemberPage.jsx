import React from 'react';
import MobileHeader from '../components/mobile/MobileHeader';
import BalanceCard from '../components/mobile/BalanceCard';
import HouseBillsCard from '../components/mobile/HouseBillsCard';
import ActionButtons from '../components/mobile/ActionButtons';
import RecentActivity from '../components/mobile/RecentActivity';
import ResponsiveGoals from '../components/ResponsiveGoals';
export default function MemberPage() {
  const handlePayShare = () => {
    console.log('Pay Share clicked');
  };

  const handleRequest = () => {
    console.log('Request clicked');
  };

  const handleDeposit = () => {
    console.log('Deposit clicked');
  };

  const mockBills = [
    { label: 'Your Share', amount: 4000 },
    { label: "You've Paid", amount: 2000 },
    { label: 'Remaining', amount: 2000 }
  ];

  const mockActivities = [
    {
      id: 1,
      name: 'Dianne Boholst',
      description: 'Fully Deposit',
      date: 'July 5',
      amount: '+1500 PHP',
      type: 'deposit'
    },
    {
      id: 2,
      name: 'Gab Vinculado',
      description: 'Partial Pay',
      date: 'July 4',
      amount: '+200 PHP',
      type: 'payment'
    },
    {
      id: 3,
      name: 'You',
      description: 'Partial Pay',
      date: 'July 5',
      amount: '+2000PHP',
      type: 'payment'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <main className="h-[59vh]  md:h-[50vh] lg:h-[52.5vh] bg-primary shadow-lg">
        <MobileHeader userName="Johnny" />
        
        <BalanceCard balance="123,456" />

        <ResponsiveGoals />
        <ActionButtons
          onPayShare={handlePayShare}
          onRequest={handleRequest}
          onDeposit={handleDeposit}
        />
        <RecentActivity activities={mockActivities} />
        
        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
