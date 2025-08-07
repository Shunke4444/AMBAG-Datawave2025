// import { useAuthRole } from "../../contexts/AuthRoleContext";
import ManagerDashboard from "./ManagerDashboard";
import MemberDashboard from "./MemberDashboard";
import NewUserDashboard from "./NewUserDashboard";

const Dashboard = () => {
  // const { authRole } = useAuthRole();

  // Hard Code for testing
  const authRole = "Manager";

  return (
    <>
      {authRole === "Manager" && <ManagerDashboard />}
      {authRole === "Member" && <MemberDashboard />}
      {authRole === "NewUser" && <NewUserDashboard />}
    </>
  );
};

export default Dashboard;
