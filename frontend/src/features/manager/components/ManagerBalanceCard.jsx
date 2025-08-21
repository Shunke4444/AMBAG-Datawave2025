import React, { useEffect, useState } from "react";
import { getMyVirtualBalance } from "../../../lib/api";
import { getAuth } from "firebase/auth";
import useIsMobile from "../../../hooks/useIsMobile";

const ManagerBalanceCard = ({ userUid }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        let uid = userUid;
        let authUid = "";
        if (!uid) {
          const user = getAuth().currentUser;
          uid = user?.uid;
          authUid = user?.uid || "Not logged in";
        } else {
          const user = getAuth().currentUser;
          authUid = user?.uid || "Not logged in";
        }
        setCurrentUid(authUid);
        if (!uid) {
          setBalance(0);
          setLoading(false);
          return;
        }
        // Fetch balance for the specified user (or manager if not provided)
        const data = await getMyVirtualBalance(uid);
        setBalance(data?.total_balance ?? 0);
      } catch (err) {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [userUid]);

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
