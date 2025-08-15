import { useState } from "react";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import NewUserDashboard from "./NewUserDashboard";
import LoanRequestModal from "../loan/LoanRequestModal";
import DashboardBtns from "./DashboardBtns";
import useIsMobile from "../../hooks/useIsMobile"; // ✅ import your hook


import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { api } from "../../lib/api";

const Dashboard = () => {
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [authRole, setAuthRole] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return setAuthRole("NewUser");
      const token = await user.getIdToken();
      const firebase_uid = user.uid;
      const res = await api.get(`/users/profile/${firebase_uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const role_type = res?.data?.role?.role_type;
      if (role_type === "manager") setAuthRole("Manager");
      else if (role_type === "contributor") setAuthRole("Member");
      else setAuthRole("NewUser");
    };
    fetchRole();
  }, []);

  return (
    <>
      {(authRole === "Manager" || authRole === "NewUser") && (
        <ManagerDashboard onLoan={() => setIsLoanOpen(true)} />
      )}
      {authRole === "Member" && (
        <MemberDashboard onLoan={() => setIsLoanOpen(true)} />
      )}

      {!isMobile && <DashboardBtns onLoan={() => setIsLoanOpen(true)} />}

      <LoanRequestModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
      />
    </>
  );
};

export default Dashboard;
