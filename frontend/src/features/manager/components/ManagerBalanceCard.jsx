import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyVirtualBalance } from "../../../lib/api";
import useIsMobile from "../../../hooks/useIsMobile";

const ManagerBalanceCard = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const data = await getMyVirtualBalance();
        // Use total_balance from backend response for real balance
        setBalance(data?.total_balance ?? 0);
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
      // Mobile view
      return (
        <div className="flex items-center justify-between w-full ml-5 mb-5">
          <div className="flex flex-col text-left">
            <span className="text-lg mb-2">Balance</span>
            <span className="text-4xl font-semibold">
              {formatCurrency(balance)}
            </span>
          </div>

          {/* Right: Button to Add Virtual Balance */}
          <button
            onClick={() => navigate("/transactions/balance")}
            className="mr-8 bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-md cursor-pointer"
          >
            + Add
          </button>
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
