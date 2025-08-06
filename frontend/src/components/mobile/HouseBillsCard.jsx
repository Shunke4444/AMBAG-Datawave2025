import React from 'react';

const HouseBillsCard = ({ 
  daysLeft = 15,
  bills = [
    { label: 'Your Share', amount: 4000 },
    { label: "You've Paid", amount: 2000 },
    { label: 'Remaining', amount: 2000 }
  ]
}) => {
  const progress = (bills[1].amount / bills[0].amount) * 100;

  return (
    <div className="mx-4 mt-4 flex space-x-3">
      {/* Circular Progress */}
      <div className="bg-primary rounded-2xl p-4 flex items-center justify-center min-w-[100px]">
        <div className="relative w-16 h-16">
          {/* Background circle */}
          <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(221, 180, 64, 0.3)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#DDB440"
              strokeWidth="4"
              strokeDasharray={`${progress * 1.76} 176`}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary">
            <span className="text-xs font-bold">{bills[1].amount.toLocaleString()}</span>
            <span className="text-xs">{bills[0].amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bills Breakdown */}
      <div className="bg-accent rounded-2xl p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-textcolor font-semibold">House Bills</span>
        </div>
        <div className="text-xs text-textcolor/70 mb-3">{daysLeft} Days Left</div>
        
        <div className="space-y-2">
          {bills.map((bill, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-textcolor/80">{bill.label}</span>
              <span className="text-xs font-semibold text-textcolor">{bill.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseBillsCard;
