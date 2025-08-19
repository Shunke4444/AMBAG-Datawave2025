
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



const DashboardBtns = ({onLoan}) => {
  const authRole = "NewUser"; // later replace with useAuthRole()
;
  const navigate = useNavigate();

  const handleLoan = () => {
    if (onLoan) onLoan();
  };
  // Role-specific buttons
  const managerButtons = [
    { icon: <PayShareIcon />, label: "Pay Share", action: () => navigate("/payment") },
    { icon: <RequestFundsIcon />, label: "Request Funds", action: () => navigate("/requests") },
    { icon: <MemberSettingsIcon />, label: "Member Settings", action: () => navigate("/member-list") },
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
    { icon: <SplitBillIcon />, label: "Allocate Qouta" , action: () => navigate()}
  ];

  const memberButtons = [
    { icon: <PayShareIcon />, label: "Pay Share", action: () => navigate("/payment")},
    { icon: <RequestFundsIcon />, label: "Request Funds", action: () => navigate("/requests")},
    { icon: <LoanIcon />, label: "Loan", action: handleLoan },
  ];

  // Select which set to use
  const selectedButtons = authRole === "Manager" ? managerButtons : memberButtons;
  

  return (
    <div className='flex w-full max-w-5xl mx-auto p-4'>
      <div>
        <h1 className='font-bold text-md p-8 text-primary'>
          {["Manager", "Member"].includes(authRole) ? "Current Members: 4" : ""}
        </h1>
      </div>
      <div className='flex flex-wrap justify-center gap-6'>
        {selectedButtons.map(({ icon, label, action }, index) => (
          <button 
          key={index} 
          onClick={action}
          className="bg-primary text-white hover:bg-primary/80
                  w-24 h-24 rounded-lg shadow cursor-pointer
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