import {
  Addchart as AddGoalIcon,
  SettingsAccessibility as MemberSettingsIcon,
  Payments as PayShareIcon,
  PsychologyAlt as RequestFundsIcon,
  CreditScore as LoanIcon,
  CallSplit as SplitBillIcon,
  Assignment as RequestsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMembersContext } from "../manager/contexts/MembersContext.jsx";
import SelectGoalModal from '../payments/SelectGoalModal';
import { useState } from 'react';

const DashboardBtns = ({onLoan, onSplitBill, onPayShare}) => {
  const { members, currentUser } = useMembersContext();
  const authRole = currentUser?.role?.role_type || currentUser?.role || "member";
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoan = () => {
    if (onLoan) onLoan();
  };
  // Role-specific buttons
  const managerButtons = [
    { icon: <PayShareIcon />, label: "Pay Share", action: () => setIsGoalModalOpen(true)},
    { icon: <MemberSettingsIcon />, label: "Member Settings", action: () => navigate("/member-list") },
    { icon: <RequestsIcon />, label: "Member Request", action: () => navigate("/requests-approval") },
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
    { icon: <SplitBillIcon />, label: "Allocate Qouta" , action: () => onSplitBill?.()}
  ];

  const memberButtons = [
  { icon: <PayShareIcon />, label: "Pay Share", action: () => setIsGoalModalOpen(true)},
    { icon: <RequestFundsIcon />, label: "Request Funds", action: () => navigate("/requests")},
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
  ];

  // Select which set to use
  const selectedButtons = authRole?.toLowerCase() === "manager" ? managerButtons : memberButtons;
  
console.log("DashboardBtns currentUser:", currentUser);
console.log("DashboardBtns detected role:", authRole);
  return (
    <div className='flex flex-col w-full max-w-5xl'>
      <h1 className='flex font-bold text-sm p-4 text-primary justify-center'>
        {(["manager", "member"].includes(authRole?.toLowerCase()) && members) ? `Current Members: ${members.length}` : ""}
      </h1>
      <div className='flex flex-wrap justify-center gap-4'>
        {selectedButtons.map(({ icon, label, action }, index) => (
          <button 
          key={index} 
          onClick={action}
          className="bg-primary text-white hover:bg-primary/80
                    w-22 h-24 px-2 py-2  rounded-lg shadow cursor-pointer
                  flex flex-col items-center justify-center
                  text-sm">
            {icon}
            <p>{label}</p>
          </button>
        ))}
      </div>
      {/* SelectGoalModal for Pay Share */}
      {isGoalModalOpen && (
        <SelectGoalModal 
          open={isGoalModalOpen} 
          onClose={() => setIsGoalModalOpen(false)} 
          onSelect={goalId => {
            setIsGoalModalOpen(false);
            navigate(`/payment/${goalId}`);
          }} 
        />
      )}
    </div>
  );
};
export default DashboardBtns