import React from 'react';
import { 
  ArrowForward, 
  AccountCircle, 
  CheckCircle, 
  Receipt,
  Handshake
} from '@mui/icons-material';
import DepositIcon from '../../assets/icons/DEPOSIT.svg';
import PartialPay from '../../assets/icons/PARTIAL-PAY.svg';
import { useNavigate } from 'react-router-dom';

const RecentActivity = ({ 
  activities = [
    {
      id: 1,
      name: 'Deposit',
      description: 'Monthly Contribution',
      date: 'Aug 5, 2025',
      amount: '+₱2,500.00',
      type: 'deposit'
    },
    {
      id: 2,
      name: 'Partial Pay',
      description: 'Loan Payment',
      date: 'Aug 3, 2025',
      amount: '+₱5,000.00',
      type: 'payment'
    },

    {
      id: 4,
      name: 'Loaned',
      description: 'Emergency Loan',
      date: 'Jul 30, 2025',
      amount: '-₱3,200.00',
      type: 'loan'
    }
  ]
}) => {

  const getAvatarIcon = (activity) => {
    switch (activity.type) {
      case 'loan':
        return <Handshake className="text-secondary" />;
      case 'withdrawal':
        return <AccountCircle className="text-secondary" />;
      case 'deposit':
        return <img src={DepositIcon} alt="Deposit" className="w-6 h-6" style={{filter: 'brightness(0) saturate(100%) invert(100%)'}} />;
      case 'payment':
        return <img src={PartialPay} alt="Partial Pay" className="w-6 h-6" style={{filter: 'brightness(0) saturate(100%) invert(100%)'}} />;
      case 'interest':
        return <CheckCircle className="text-secondary" />;
      default:
        return <Receipt className="text-secondary" />;
    }
  };

  const navigate = useNavigate();
  const handleRecentActivityClick = (activity) => {
  navigate(`/app/transactions/history`);
  };


  return (
    <div className="mx-4 mt-24 rounded-t-2xl ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-textcolor">Recent Activity</h3>
        <button 
          onClick={handleRecentActivityClick} 
          className="w-10 h-10 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <ArrowForward className="w-5 h-5 text-white" />
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-xl shadow-md">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              {getAvatarIcon(activity)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-textcolor truncate">{activity.name}</div>
              <div className="text-sm text-textcolor/60">
                {activity.date} • {activity.description}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className={`font-semibold ${
                activity.type === 'deposit' || activity.type === 'payment' || activity.type === 'interest' 
                  ? 'text-green' 
                  : 'text-primary'
              }`}>
                {activity.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
