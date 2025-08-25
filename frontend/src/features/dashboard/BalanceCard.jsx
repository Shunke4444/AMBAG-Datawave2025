import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyVirtualBalance } from '../../lib/api';
import useIsMobile from '../../hooks/useIsMobile';

const BalanceCard = () => {
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isUseMobile = useIsMobile();
  const navigate = useNavigate();

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


  if (isUseMobile) {
  return (
    <main className="mx-4 mt-4 mb-2 text-white">
      <div className="flex items-center justify-between">
        {/* Left: Balance label + value */}
        <div>
          <h2 className="text-md">Balance</h2>
          {loading ? (
            <h1 className="text-2xl font-semibold">Loading...</h1>
          ) : error ? (
            <h1 className="text-2xl font-semibold text-red-300">{error}</h1>
          ) : (
            <h1 className="text-4xl font-semibold">
              ₱{amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
          )}
        </div>

        {/* Right: Button to Add Virtual Balance */}
        <button
          onClick={() => navigate("/app/transactions/balance") } 
          className="mr-4 bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-md cursor-pointer"
        >
          + Add
        </button>
      </div>
    </main>
    );
  };

  return (
    <main className="mx-4 mt-4 mb-2 ">
      <div>
        <h2 className='text-md font-semibold text-primary '>Current Balance:</h2>
        {loading ? (
          <h1 className='text-2xl font-semibold'>Loading...</h1>
        ) : error ? (
          <h1 className='text-2xl font-semibold text-red-300'>{error}</h1>
        ) : (
          <h1 className='text-4xl font-semibold text-textcolor'>₱{amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
        )}
      </div>
    </main>
  );
};

export default BalanceCard;
