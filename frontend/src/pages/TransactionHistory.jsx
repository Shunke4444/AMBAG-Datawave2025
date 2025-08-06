import { useState } from 'react';
import {
  Search, 
  FilterList, 
  AccountBalance, 
  CheckCircle, 
  Receipt
  
} from '@mui/icons-material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileHeader from '../components/MobileHeader';
import BPILogo from '../assets/images/BPILOGO.png';
import DepositIcon from '../assets/icons/DEPOSIT.svg';
import WithdrawIcon from '../assets/icons/WITHDRAW.svg';
import PartialPay from '../assets/icons/PARTIAL-PAY.svg';

export default function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const activities = [
    {
      id: 1,
      name: 'BPI Bank',
      date: 'July 5',
      type: 'Loan Received',
      amount: '+15000 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 2,
      name: 'Self',
      date: 'July 4',
      type: 'Withdraw',
      amount: '-500 PHP',
      amountColor: 'text-red-500',
    },
    {
      id: 3,
      name: 'Self',
      date: 'July 3',
      type: 'Deposit',
      amount: '+2000 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 4,
      name: 'Self',
      date: 'July 2',
      type: 'Partial Pay',
      amount: '+800 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 5,
      name: 'Juan Dela Cruz',
      date: 'July 1',
      type: 'Loan Received',
      amount: '+5000 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 6,
      name: 'Self',
      date: 'June 30',
      type: 'Deposit',
      amount: '+1200 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 7,
      name: 'Self',
      date: 'June 29',
      type: 'Fully Paid',
      amount: '+950 PHP',
      amountColor: 'text-green-500',
    },
    {
      id: 8,
      name: 'BPI Bank',
      date: 'June 28',
      type: 'Loan Received',
      amount: '+8000 PHP',
      amountColor: 'text-green-500',
    },
  ];

  const getAvatarIcon = (activity) => {
    if (activity.name === 'BPI Bank') {
      return <img src={BPILogo} alt="BPI Logo" className="w-full h-full object-cover" />;
    }

    switch (activity.type) {
      case 'Loan Received':
        return <HandshakeIcon className="text-white" />;
      case 'Withdraw':
        return <img src={WithdrawIcon} alt="Withdraw" className="w-6 h-6 text-white" style={{filter: 'brightness(0) saturate(100%) invert(100%)'}} />;
      case 'Deposit':
        return <img src={DepositIcon} alt="Deposit" className="w-6 h-6 text-white" style={{filter: 'brightness(0) saturate(100%) invert(100%)'}} />;
      case 'Partial Pay':
        // maybe i can find a better icon for this
        return <img src={PartialPay} alt="Partial Pay" className="w-6 h-6 text-white" style={{filter: 'brightness(0) saturate(100%) invert(100%)'}} />;
      case 'Fully Paid':
        return <CheckCircle className="text-white" />;
      default:
        return <Receipt className="text-white" />;
    }
  };

  return (
    <main className="flex flex-col w-full h-[100vh] overflow-hidden">
      
      <MobileHeader title="Transaction History" />

      <section className="flex-1 bg-primary overflow-y-auto rounded-t-[2.5rem] mt-5 sm:px-6 py-6 sm:py-8 min-h-0">
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 mx-4 sm:mx-0">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-secondary opacity-70" />
            </div>
            <input
              type="search"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-transparent border-2 border-secondary/30 rounded-lg sm:rounded-xl text-sm sm:text-base text-secondary placeholder-secondary/70 focus:outline-none focus:border-secondary transition-colors"
              aria-label="Search recent activities"
            />
          </div>
          <button 
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-transparent border-2 border-secondary/30 rounded-lg sm:rounded-xl text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
            aria-label="Filter activities"
          >
            <FilterList className="text-lg sm:text-xl" />
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4 mx-4 sm:mx-0">
          {activities
            .filter(activity => 
              activity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
              activity.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((activity) => (
              <article 
                key={activity.id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white overflow-hidden`}>
                    {getAvatarIcon(activity)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-textcolor truncate">
                    {activity.type}
                  </h3>
                  <p className="text-xs sm:text-sm text-textcolor/70">
                    {activity.date}{activity.name !== 'Self' ? ` • Received from ${activity.name}` : ''}
                  </p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <span className={`font-bold text-xs sm:text-sm ${activity.amountColor}`}>
                    {activity.amount}
                  </span>
                </div>
              </article>
            ))}
        </div>

        {activities.filter(activity => 
          activity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-8 sm:py-12 mx-4 sm:mx-0">
            <p className="text-secondary/70 text-base sm:text-lg">No activities found</p>
            <p className="text-secondary/50 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </section>
    </main>
  );
}

