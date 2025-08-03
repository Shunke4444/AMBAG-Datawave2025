import React from 'react';
import Request from '../../assets/icons/request.svg';
import PayShare from '../../assets/icons/payshare.svg';
import Deposit from '../../assets/icons/DEPOSIT.svg';
const ActionButtons = ({ onPayShare, onRequest, onDeposit }) => {
  const actions = [
    {
      icon: <img src={PayShare} alt="Pay Share" className=" text-textcolor" />,
      label: 'Pay Share',
      onClick: onPayShare
    },
    {
      icon: <img src={Request} alt="Request" className=" text-textcolor" />,
      label: 'Request',
      onClick: onRequest
    },
    {
      icon: <img src={Deposit} alt="Deposit" className=" ml-[0.75rem] w-12 h-12 text-textcolor" style={{filter: 'brightness(0)'}} />,
      label: 'Deposit',
      onClick: onDeposit
    }
  ];

  return (
    <main className="mx-4 mt-[5rem]">
      <div className="flex justify-between mt-4 space-x-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex-1 bg-accent  rounded-2xl p-4 flex flex-col items-center space-y-2 shadow-sm hover:shadow-md "
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
