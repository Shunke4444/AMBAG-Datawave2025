import { useNavigate } from 'react-router-dom';
import { Handshake, Add as AddIcon } from '@mui/icons-material';
import Loan from '../../assets/icons/loan.svg';
import PayShare from '../../assets/icons/payshare.svg';
import Deposit from '../../assets/icons/DEPOSIT.svg';
import CreateGoalModal from '../goals/CreateGoalModal';
import { useState } from 'react';
import { useMembersContext } from "../../features/manager/contexts/MembersContext.jsx";
import { useAuthRole } from '../../contexts/AuthRoleContext';

const ActionButtons = ({ onPayShare, onLoan, onCreateGoal }) => {
  const { user } = useAuthRole();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  // Debug: Track when modal is opened
  console.log('ActionButtons rendered. isGoalModalOpen:', isGoalModalOpen);
  const navigate = useNavigate();

  const handlePayShare = () => {
    if (onPayShare) onPayShare();
  };
  const { members, loading, currentUser } = useMembersContext();
  const member = currentUser || {};
  const handleRequest = () => {
    if (member?.role?.role_type === 'manager' || member?.role === 'manager' || member?.role_type === 'manager') {
      console.log('Create Goal button clicked, opening modal');
      setIsGoalModalOpen(true);
    } else {
      navigate('/member-requests');
    }
  };

  const handleDeposit = () => {
    navigate('/transactions/deposit');
  };

  const handleLoan = () => {
    if (onLoan) onLoan();
  };

  const actions = [
    {
      icon: <img src={PayShare} alt="Pay Share" className="w-12 h-12 text-textcolor" />,
      label: 'Pay Share',
      onClick: handlePayShare
    },
    (member?.role?.role_type === 'manager' || member?.role === 'manager' || member?.role_type === 'manager')
      ? {
          icon: <AddIcon fontSize='large' className="w-12 h-12 text-black" />,
          label: 'Create Goal',
          onClick: handleRequest
        }
      : {
          icon: <Handshake fontSize='large' className="w-12 h-12 text-black" />,
          label: 'Request',
          onClick: handleRequest
        },
    {
      icon: <img src={Deposit} alt="Deposit" className="w-12 h-12 text-textcolor" style={{filter: 'brightness(0)'}} />,
      label: 'Deposit',
      onClick: handleDeposit
    },
    {
      icon: <img src={Loan} alt="Loan" className="w-10 h-10 text-textcolor" style={{filter: 'brightness(0)'}} />,
      label: 'Loan',
      onClick: handleLoan
    }
  ];

  return (
    <main className="mx-4 mt-[5rem]">
      <div className="flex justify-between mt-4 space-x-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex-1 bg-accent  rounded-2xl p-4 flex flex-col items-center space-y-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12  rounded-xl flex items-center justify-center">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-textcolor">{action.label}</span>
          </button>
        ))}
      </div>
      {(member?.role?.role_type === 'manager' || member?.role === 'manager' || member?.role_type === 'manager') && (
        <CreateGoalModal
          open={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onCreateGoal={onCreateGoal}
        />
      )}
    </main>
  );
};

export default ActionButtons;
