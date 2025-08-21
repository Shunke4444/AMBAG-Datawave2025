import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../dashboard/BalanceCard';
import MemberHeader from '../members/MemberHeader'
import HouseBillsCard from '../dashboard/HouseBillsCard';
import ActionButtons from '../dashboard/ActionButtons';
import SelectGoalModal from '../payments/SelectGoalModal';
import RecentActivity from '../dashboard/RecentActivity';
import ResponsiveGoals from '../goals/ResponsiveGoals';
import LoanPage from '../loan/LoanPage';
import { getAuth } from 'firebase/auth';
import { api, listGoals } from '../../lib/api';

export default function MemberPage() {
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    const fetchFirstName = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const firebase_uid = user.uid;
        const res = await api.get(`/users/profile/${firebase_uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFirstName(res?.data?.profile?.first_name || '');
      } catch (err) {
        setFirstName('');
      }
    };
    fetchFirstName();
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const goalsData = await listGoals();
        setGoals(goalsData || []);
      } catch (err) {
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handlePayShare = () => {
    setIsGoalModalOpen(true);
  };
  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
  };

  const handleRequest = () => {
    console.log('Request clicked');
  };

  const handleDeposit = () => {
    console.log('Deposit clicked');
  };

  const handleLoan = () => {
    setIsLoanModalOpen(true);
  };

  const handleCloseLoanModal = () => {
    setIsLoanModalOpen(false);
  };

  const mockBills = [
    { label: 'Your Share', amount: 4000 },
    { label: "You've Paid", amount: 2000 },
    { label: 'Remaining', amount: 2000 }
  ];


  return (
    <div className="min-h-screen bg-secondary">
      <main className="bg-primary shadow-lg pb-4">
        <MemberHeader userName={firstName || "User"} />
        <BalanceCard balance="123,456" />
        <ResponsiveGoals goals={goals} loading={goalsLoading} />
        <ActionButtons
          onPayShare={handlePayShare}
          onRequest={handleRequest}
          onDeposit={handleDeposit}
          onLoan={handleLoan}
        />
        <SelectGoalModal 
          open={isGoalModalOpen} 
          onClose={handleCloseGoalModal} 
          onSelect={goalId => {
            navigate(`/payment/${goalId}`);
          }} 
        />
      </main>
      <RecentActivity />
      {/* Bottom spacing for mobile */}
      <div className="h-8"></div>
      {/* Loan Modal */}
      <LoanPage 
        isModalOpen={isLoanModalOpen}
        onCloseModal={handleCloseLoanModal}
      />
    </div>
  );
}
