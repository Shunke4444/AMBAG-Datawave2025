import React, { useEffect, useState } from 'react';
import { getMyVirtualBalance } from '../../lib/api';

const BalanceCard = () => {
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      setError("");
      try {
        const data = await getMyVirtualBalance();
        setAmount(data?.total_balance ?? 0);
      } catch (e) {
        setError("Could not fetch balance");
      }
      setLoading(false);
    }
    fetchBalance();
  }, []);

  return (
    <main className="mx-4 mt-4 mb-2 text-white ">
      <div>
        <h2 className='text-md '>Balance</h2>
        {loading ? (
          <h1 className='text-2xl font-semibold'>Loading...</h1>
        ) : error ? (
          <h1 className='text-2xl font-semibold text-red-300'>{error}</h1>
        ) : (
          <h1 className='text-4xl font-semibold'>₱{amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
        )}
      </div>
    </main>
  );
};

export default BalanceCard;
