import React from 'react';

const BalanceCard = ({ balance = "123,456" }) => {
  return (
    <main className="mx-4 mt-4 mb-2 text-white ">
        <div>
            <h2 className='text-md '>Balance</h2>
            <h1 className='text-4xl font-semibold'>${balance}</h1>
        </div>
    </main>
  );
};

export default BalanceCard;
