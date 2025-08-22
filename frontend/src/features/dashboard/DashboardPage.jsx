import { useState } from "react";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import LoanRequestModal from "../loan/LoanRequestModal";
import { useAuthRole } from "../../contexts/AuthRoleContext";

const Dashboard = () => {
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const { authRole } = useAuthRole();

  return (
    <>
      {(authRole === "Manager" || authRole === "NewUser") && (
        <ManagerDashboard onLoan={() => setIsLoanOpen(true)} />
      )}
      {authRole === "Member" && (
        <MemberDashboard onLoan={() => setIsLoanOpen(true)} />
      )}
      <LoanRequestModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
      />
    </>
  );
};

export default Dashboard;
