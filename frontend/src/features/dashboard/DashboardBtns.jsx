
// import { useAuthRole } from "../../contexts/AuthRoleContext";
import {
  Addchart as AddGoalIcon,
  NotificationsActive as NotifyIcon,
  SettingsAccessibility as ManageMembersIcon,
  RequestPage as SendRequestIcon,
  Payments as DepositIcon,
  PsychologyAlt as WithdrawIcon,
  
} from '@mui/icons-material';

import useIsMobile from '../../hooks/useIsMobile';


const DashboardBtns = () => {
  const authRole = "Manager"; // later replace with useAuthRole()
  const isMobile = useIsMobile();

  const btnClass = `${isMobile ? "bg-accent" : "bg-primary"} text-white hover:bg-primary/80 px-4 py-4 my-4 rounded-lg shadow cursor-pointer flex flex-col items-center`;

  // Shared mobile buttons (same for all roles)
  const mobileButtons = [
    {
      icon: <SendRequestIcon />,
      label: "Send Request",
    },
    {
      icon: <DepositIcon />,
      label: "Share Contribute",
    },
    {
      icon: <WithdrawIcon />,
      label: "Ask Funds",
    },
  ];

  // Role-based buttons (desktop only)
  const managerButtons = [
    {
      icon: <AddGoalIcon />,
      label: "Add Goals",
    },
    {
      icon: <NotifyIcon />,
      label: "Notify Members",
    },
    {
      icon: <ManageMembersIcon />,
      label: "Manage Members",
    },
  ];

  const memberButtons = [
    {
      icon: <SendRequestIcon />,
      label: "Send Request",
    },
    {
      icon: <DepositIcon />,
      label: "Share Contribute",
    },
    {
      icon: <WithdrawIcon />,
      label: "Ask Funds",
    },
  ];

  // Decide which to render based on screen size
  const selectedButtons = isMobile
    ? mobileButtons // Show same buttons on mobile
    : authRole === "Manager"
      ? managerButtons
      : authRole === "Member"
        ? memberButtons
        : [];

  if (isMobile) {
    return (
      <div className='flex gap-16 justify-center'>
        <div className='flex gap-8'>
          {selectedButtons.map(({ icon, label }, index) => (
            <button key={index} className={btnClass}>
              {icon}
              <p>{label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-16'>
      <div>
        <h1 className='font-bold text-md p-8 text-primary'>
          {authRole === "Manager" ? "Current Members: 4" : "Current Members: 4"}
        </h1>
      </div>
      <div className='flex gap-8'>
        {selectedButtons.map(({ icon, label }, index) => (
          <button key={index} className={btnClass}>
            {icon}
            <p>{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardBtns