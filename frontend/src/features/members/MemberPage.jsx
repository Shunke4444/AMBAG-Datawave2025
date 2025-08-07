
import BalanceCard from '../dashboard/BalanceCard';
import HouseBillsCard from '../dashboard/HouseBillsCard';
import ActionButtons from '../dashboard/ActionButtons';
import RecentActivity from '../dashboard/RecentActivity';
import ResponsiveGoals from '../goals/ResponsiveGoals';
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


  return (
    <div className="min-h-screen bg-secondary">
      <main className="h-[59vh]  md:h-[50vh] lg:h-[52.5vh] bg-primary shadow-lg">
        
        <BalanceCard balance="123,456" />

        <ResponsiveGoals />
        <ActionButtons
          onPayShare={handlePayShare}
          onRequest={handleRequest}
          onDeposit={handleDeposit}
        />
        <RecentActivity />
        {/* Bottom spacing for mobile */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
