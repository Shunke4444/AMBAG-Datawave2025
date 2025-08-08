import { useState } from "react";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import NewUserDashboard from "./NewUserDashboard";
import LoanRequestModal from "../loan/LoanRequestModal";
import DashboardBtns from "./DashboardBtns";
import useIsMobile from "../../hooks/useIsMobile"; // ✅ import your hook

const Dashboard = () => {
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const authRole = "Manager"; // Hard-coded for testing
  const isMobile = useIsMobile(); // ✅ detect mobile

  return (
    <>
      {authRole === "Manager" && <ManagerDashboard />}
      {authRole === "Member" && <MemberDashboard />}
      {authRole === "NewUser" && <NewUserDashboard />}

      {/* ✅ Only show buttons if NOT mobile */}
      {!isMobile && <DashboardBtns onLoan={() => setIsLoanOpen(false)} />}

      <LoanRequestModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
      />
    </>
  );
};

export default Dashboard;
