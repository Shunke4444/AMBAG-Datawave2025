import React from 'react';
import { ArrowForward, AccountCircle } from '@mui/icons-material';

const RecentActivity = ({ 
  activities = [
    {
      id: 1,
      name: 'Dianne Boholst',
      description: 'Fully Deposit',
      date: 'July 5',
      amount: '+1500 PHP',
      type: 'deposit'
    },
    {
      id: 2,
      name: 'Gab Vinculado',
      description: 'Partial Pay',
      date: 'July 4',
      amount: '+200 PHP',
      type: 'payment'
    },
    {
      id: 3,
      name: 'You',
      description: 'Partial Pay',
      date: 'July 5',
      amount: '+2000PHP',
      type: 'payment'
    }
  ]
}) => {
  return (
    <div className="mx-4 mt-6 rounded-t-2xl ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-textcolor">Recent Activity</h3>
        <ArrowForward className="w-5 h-5 text-textcolor/60" />
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-xl">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <AccountCircle className="w-6 h-6 text-secondary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-textcolor truncate">{activity.name}</div>
              <div className="text-sm text-textcolor/60">
                {activity.date} • {activity.description}
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className={`font-semibold ${
                activity.type === 'deposit' ? 'text-green' : 'text-accent'
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
