import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembersContext } from "../manager/contexts/MembersContext.jsx"; // ✅ bring context
import SelectGoalModal from "../payments/SelectGoalModal";
import CreateGoalModal from "../goals/CreateGoalModal"; 
import AddIcon from "@mui/icons-material/Add";
import PayShare from "../../assets/icons/payshare.svg"; 
import Deposit from "../../assets/icons/DEPOSIT.svg";
import LoanIcon from "../../assets/icons/loan.svg"; 
import RequestIcon  from "../../assets/icons/request.svg";

const ActionButtons = ({ onLoan, onPayShare }) => {
  const navigate = useNavigate();
  const { currentUser } = useMembersContext(); // ✅ fetch current user
  const authRole = currentUser?.role?.role_type || currentUser?.role || "member"; 

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false); // for Pay Share
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false); // for Create Goal

  // ---------- Button Handlers ----------
  const handlePayShare = () => {
    if (onPayShare) onPayShare(); 
    else setIsGoalModalOpen(true); 
  };

  const handleLoan = () => {
    if (onLoan) onLoan(); 
  };

  const handleCreateGoal = () => {
    setIsCreateGoalOpen(true);
  };

  const handleRequestFunds = () => navigate("/app/requests");

  const handleDeposit = () => navigate("/app/transactions/deposit");

  // ---------- Action Buttons List ----------
 const ICON_SIZE = "w-12 h-12"; // standard size for all icons

const actions = [
  { 
    icon: <div className={`flex items-center justify-center ${ICON_SIZE}`}><img src={PayShare} alt="Pay Share" className="max-w-full max-h-full" /></div>, 
    label: "Pay Share", 
    onClick: handlePayShare 
  },
  authRole?.toLowerCase() === "manager"
    ? { 
        icon: <div className={`flex items-center justify-center ${ICON_SIZE}`}><AddIcon className="w-full h-full" /></div>, 
        label: "Create Goal", 
        onClick: handleCreateGoal 
      }
    : { 
        icon: <div className={`flex items-center justify-center ${ICON_SIZE}`}><img src={RequestIcon} alt="Request Funds" className="max-w-full max-h-full" /></div>, 
        label: "Request Funds", 
        onClick: handleRequestFunds 
      },
  { 
    icon: <div className={`flex items-center justify-center ${ICON_SIZE}`}><img src={Deposit} alt="Deposit" className="max-w-full max-h-full" /></div>, 
    label: "Deposit", 
    onClick: handleDeposit 
  },
  { 
    icon: <div className={`flex items-center justify-center ${ICON_SIZE}`}><img src={LoanIcon} alt="Loan" className="max-w-full max-h-full" /></div>, 
    label: "Loan", 
    onClick: handleLoan 
  },
];

  return (
    <>
      <div className="flex justify-between mt-4 space-x-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex-1 bg-accent rounded-2xl p-4 flex flex-col items-center space-y-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Pay Share Modal */}
      {isGoalModalOpen && (
        <SelectGoalModal
          open={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onSelect={(goalId) => {
            setIsGoalModalOpen(false);
            navigate(`/app/payment/${goalId}`);
          }}
        />
      )}

      {/* CreateGoalModal for managers */}
      {isCreateGoalOpen && (
        <CreateGoalModal
          open={isCreateGoalOpen}
          onClose={() => setIsCreateGoalOpen(false)}
          onCreateGoal={(newGoal) => {
            console.log("✅ New goal created:", newGoal);
            setIsCreateGoalOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ActionButtons;
