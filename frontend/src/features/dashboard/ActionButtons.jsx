
import { useNavigate } from 'react-router-dom';
import { Handshake } from '@mui/icons-material';
import Loan from '../../assets/icons/loan.svg';
import PayShare from '../../assets/icons/payshare.svg';
import Deposit from '../../assets/icons/DEPOSIT.svg';

const ActionButtons = ({ onPayShare, onLoan }) => {
  const navigate = useNavigate();

  const handlePayShare = () => {
    if (onPayShare) onPayShare();
  };

  const handleRequest = () => {
    navigate('/member-requests');
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
    {
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
    </main>
  );
};

export default ActionButtons;
