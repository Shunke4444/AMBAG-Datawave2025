
// import { useAuthRole } from "../../contexts/AuthRoleContext";
import {
  Addchart as AddGoalIcon,
  SettingsAccessibility as MemberSettingsIcon,
  Payments as PayShareIcon,
  PsychologyAlt as RequestFundsIcon,
  CreditScore as LoanIcon,
  CallSplit as SplitBillIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';



const DashboardBtns = ({onLoan, onSplitBill, onPayShare}) => {
  const authRole = "Manager"; // later replace with useAuthRole()
;
  const navigate = useNavigate();

  const handleLoan = () => {
    if (onLoan) onLoan();
  };
  // Role-specific buttons
  const managerButtons = [
    { icon: <PayShareIcon />, label: "Pay Share", action: onPayShare},
    { icon: <RequestFundsIcon />, label: "Request Funds", action: () => navigate("/requests") },
    { icon: <MemberSettingsIcon />, label: "Member Settings", action: () => navigate("/member-list") },
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
    { icon: <SplitBillIcon />, label: "Allocate Qouta" , action: () => onSplitBill?.()}
  ];

  const memberButtons = [
    { icon: <PayShareIcon />, label: "Pay Share", action: onPayShare ? onPayShare : () => navigate("/payment")},
    { icon: <RequestFundsIcon />, label: "Request Funds", action: () => navigate("/requests")},
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
  ];

  // Select which set to use
  const selectedButtons = authRole === "Manager" ? managerButtons : memberButtons;
  

  return (
    <div className='flex w-full max-w-5xl'>
      <div>
        <h1 className='flex font-bold text-sm p-4 text-primary'>
          {["Manager", "Member"].includes(authRole) ? "Current Members: 4" : ""}
        </h1>
      </div>
      <div className='flex flex-wrap justify-center gap-4'>
        {selectedButtons.map(({ icon, label, action }, index) => (
          <button 
          key={index} 
          onClick={action}
          className="bg-primary text-white hover:bg-primary/80
                  w-20 h-20 rounded-lg shadow cursor-pointer
                  flex flex-col items-center justify-center
                  text-sm">
            {icon}
            <p>{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardBtns