import { useState } from "react";
import Sidebar from "./Sidebar";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
  Home as HomeIcon,
  SettingsAccessibility as MembersSettingsIcon,
  Assignment as RequestsIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useTheme, useMediaQuery } from "@mui/material";
import useIsMobile from "../../hooks/useIsMobile";
import Notifications from "../../features/notifications/Notifications";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isUseMobile = useIsMobile();

  const isFullScreenPage = location.pathname === '/ai-assistant';
  const shouldHideHeader = isFullScreenPage || isMobile;

  // Notification dialog handlers (placeholders)
  const toggleNotifDialog = () => setNotifDialogOpen((open) => !open);
  const closeNotifDialog = () => setNotifDialogOpen(false);
  const handleApprove = () => {};
  const handleDecline = () => {};

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("goals")) return "Goals";
    if (path.includes("settings")) return "Settings";
    if (path.includes("withdrawal")) return "Withdrawal";
    if (path.includes("deposit")) return "Deposit";
    if (path.includes("audit")) return "Audit Logs";
    if (path.includes("transactions")) return "Transactions";
    if (path.includes("ai-assistant")) return "AI Assistant";
    return "Dashboard";
  };

  // Global Notifs , accesses both mobile and desktop notifs
  const notifArray = [
    {
      id: 1,
      type: "request",
      title: "Goal Request from Member",
      details: "Member wants to add goal for tuition fee",
      time: "9:18am",
      date: "06/08/2025",
    },
    {
      id:2,
      type: "info",
      title: "Contribution received from Member",
      details: "Member contributed 2,500.00 PHP in Tuition Fee",
      time: "2:32pm",
      date: "06/08/2025",
    },
    {
      id: 3,
      type: "info",
      title: "Contribution received from Member",
      details: "Member contributed 2,500.00 PHP in Tuition Fee",
      time: "7:45pm",
      date: "06/08/2025",
    },
  ]

  // MOBILE LAYOUT
  if (isUseMobile) {
    return (
      <>
        <div className="flex justify-between items-center p-4 bg-primary">
          <p className="text-md font-semibold text-secondary">
            Hello <span className="text-yellow-400 font-bold">User!</span>
          </p>
          <div className="flex gap-4">
            <button className="cursor-pointer">
              <NotifyIcon onClick={toggleNotifDialog} className="text-secondary" />
            </button>
            <button onClick={() => navigate("/help-support")} className="cursor-pointer">
              <SupportIcon className="text-secondary" />
            </button>
            <button onClick={() => navigate("/settings")} className="cursor-pointer">
              <SettingIcon className="text-secondary" />
            </button>
          </div>
        </div>

        <Outlet />
        {notifDialogOpen && (
          <Notifications
            notifs={notifArray}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onNotifClick={closeNotifDialog}
          />
        )}

        {/* Mobile Bottom Nav */}
        {!isFullScreenPage && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-t-gray-300 rounded-tl-3xl rounded-tr-3xl shadow-md flex justify-around py-2 z-50">
            <button onClick={() => navigate("/dashboard")} className="flex flex-col items-center text-primary text-xs">
              <HomeIcon className="text-primary" />
              <span>Home</span>
            </button>
            <button onClick={() => navigate("/requests")} className="flex flex-col items-center text-gray-400 text-xs">
              <RequestsIcon className="text-primary" />
              <span>Requests</span>
            </button>
            <button onClick={() => navigate("/members")} className="flex flex-col items-center text-gray-400 text-xs">
              <MembersSettingsIcon className="text-primary" />
              <span>Members</span>
            </button>
          </nav>
        )}
      </>
    );
  }

  // DESKTOP LAYOUT
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={false}
        />
      </div>

      <main
        className={`
          flex-1 transition-all duration-300 overflow-hidden
          ${isFullScreenPage ? "" : "px-0 lg:px-6"}
          ${isCollapsed ? "lg:ml-24" : "lg:ml-64"}
          ml-0
        `}
      >
        {/* Global Top Header */}
        {!shouldHideHeader && (
          <div className="flex justify-between items-center py-6 px-10">
            <h1 className="text-xl font-bold text-textcolor">
              {getPageTitle()}
            </h1>
            <div className="flex gap-4 items-center text-textcolor">
              <button className="cursor-pointer">
                <NotifyIcon className="hover:text-primary" />
              </button >
              <button className="cursor-pointer">
                <SupportIcon className="hover:text-primary" />
              </button >
              <button onClick={() => navigate("/settings")} className="cursor-pointer">
                <SettingIcon className="hover:text-primary" />
              </button>
            </div>
          </div>
        )}

        <Outlet />
          {notifDialogOpen && (
          <Notifications
            notifs={notifArray}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        )}
      </main>
    </div>
  );
};

export default Layout;