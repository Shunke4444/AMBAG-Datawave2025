import { useState } from "react";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import NewUserDashboard from "./NewUserDashboard";
import LoanRequestModal from "../loan/LoanRequestModal";
import DashboardBtns from "./DashboardBtns";
import useIsMobile from "../../hooks/useIsMobile"; // ✅ import your hook
import { useEffect } from "react";

const Dashboard = () => {
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const authRole = "Manager"; 
  const isMobile = useIsMobile(); // ✅ detect mobile


  return (
    <>
      {authRole === "Manager" && (
        <ManagerDashboard onLoan={() => setIsLoanOpen(true)} />
      )}
      {authRole === "Member" && (
        <MemberDashboard onLoan={() => setIsLoanOpen(true)} />
      )}
      {authRole === "NewUser" && <NewUserDashboard />}

      {/* ✅ Only show buttons if NOT mobile */}
      {!isMobile && <DashboardBtns onLoan={() => setIsLoanOpen(true)} />}

      <LoanRequestModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
      />
    </>
  );
};

export default Dashboard;
