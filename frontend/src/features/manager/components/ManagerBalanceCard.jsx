import React, { useEffect, useState } from "react";
import { getMyVirtualBalance } from "../../../lib/api";
import useIsMobile from "../../../hooks/useIsMobile";

const ManagerBalanceCard = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const data = await getMyVirtualBalance();
        setBalance(data?.balance ?? 0);
      } catch (err) {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // Format currency (PHP)
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 shadow text-center text-gray-500">Loading balance...</div>
    );
  }

  if (isMobile) {
    // Mobile: mimic member balance card style
    return (
   <div className="flex flex-col w-full ml-5 mb-5 text-left">
        <span className="text-lg font mb-2 text text-left"> Balance</span>
        <span className="text-3xl font-medium text-left">{formatCurrency(balance)}</span>
      </div>
    );
  }

  // Desktop: prominent card/banner above goals
    return (
      <div className="flex flex-col w-full ml-5 mb-5 text-left">
        <span className="text-lg font-semibold mb-2 text-primary text-left">Current Balance</span>
        <span className="text-3xl font-semibold text-left">{formatCurrency(balance)}</span>
      </div>
    );
};

export default ManagerBalanceCard;
