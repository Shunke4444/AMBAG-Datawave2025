import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
  Home as HomeIcon,
  SettingsAccessibility as MembersSettingsIcon,
  Assignment as RequestsIcon,
  Menu as MenuIcon,
  SmartToy as AssistantIcon,
  Add as AddGoalcon,
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from "@mui/material";
import useIsMobile from "../../hooks/useIsMobile";
import Notifications from "../../features/notifications/Notifications";
import { ManagerNotifs }  from "../../features/notifications/ManagerNotifs";
import { MemberNotifs } from "../../features/notifications/MemberNotifs";
import MobileHeader from "../../components/MobileHeader";
import { useAuthRole } from "../../contexts/AuthRoleContext";
import useSidebar from "../../hooks/useSidebar";

// Remove hardcoded authRole. We'll fetch it dynamically.

const Layout = () => {
  console.log("Layout component rendering");
  const { isCollapsed, setIsFullScreenPage } = useSidebar();
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const { authRole, setAuthRole } = useAuthRole();
  const [roleError, setRoleError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false); // No loading needed since we use context
  const isUseMobile = useIsMobile();
  
  console.log("Mobile detection debug - MUI isMobile:", isMobile, "useIsMobile:", isUseMobile, "window width:", window.innerWidth);
  console.log("Context authRole:", authRole);
  console.log("Context setAuthRole function:", typeof setAuthRole);

  // Remove duplicate role detection - let DashboardPage handle it
  // The role should be set by the AuthRoleProvider or DashboardPage

  const isFullScreenPage = location.pathname === '/ai-assistant' || 
    location.pathname.includes('/payment') || 
    location.pathname.includes('/confirm') || 
    location.pathname.includes('/receipt') ||
    location.pathname.includes('/what-if') ||
    (location.pathname.includes('/request') && !location.pathname.includes('requests-approval')) ||
    location.pathname.includes('member-requests') ||
    location.pathname.includes('notification');
  const shouldHideHeader = isFullScreenPage || isMobile;
  
  console.log("FullScreen debug - pathname:", location.pathname, "isFullScreenPage:", isFullScreenPage);

  // Choose notifications based on real role
  const notifs = authRole === "Manager" ? ManagerNotifs : MemberNotifs;

  useEffect(() => {
    setIsFullScreenPage(isFullScreenPage);
  }, [isFullScreenPage, setIsFullScreenPage]);

  // Notification dialog handlers (placeholders)
  const toggleNotifDialog = () => setNotifDialogOpen((open) => !open);
  const closeNotifDialog = () => setNotifDialogOpen(false);
  const handleApprove = () => {};
  const handleDecline = () => {};
    // Handle background scroll
  useEffect(() => {
  document.body.style.overflow = notifDialogOpen ? "hidden" : "auto";
  return () => {
    document.body.style.overflow = "auto";
  };
}, [notifDialogOpen]);



  const pageTitles = {
    dashboard: "Dashboard",
    goals: "Goals",
    settings: "Settings",
    withdrawal: "Withdrawal",
    deposit: "Deposit",
    audit: "Audit Logs",
    transactions: "Transactions",
    "ai-assistant": "AI Assistant",
    "requests-approval": "Requests Approval",
    "member-list": "Members",
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const key = Object.keys(pageTitles).find((k) => path.includes(k));
    return pageTitles[key] || "Dashboard";
  };

if (isUseMobile) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (roleError) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50">
        <div className="text-center">
          <p className="text-red-500 font-semibold">⚠️ {roleError}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main mobile layout
  return (
    <>
      {!isFullScreenPage && 
      <MobileHeader 
        title={getPageTitle()} 
        onNotifClick={toggleNotifDialog} 
      />}

      <Outlet />

      {notifDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeNotifDialog}
          />
          <Notifications
            notifs={notifs}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        </>
      )}

             {/* Mobile Bottom Nav */}
        {console.log("Mobile nav debug - isFullScreenPage:", isFullScreenPage, "authRole:", authRole, "isUseMobile:", isUseMobile, "condition result:", !isFullScreenPage && authRole === "Manager")}
        {!isFullScreenPage && authRole === "Manager" && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-t-gray-300 rounded-tl-3xl rounded-tr-3xl shadow-md flex justify-around py-2 z-50">
          <button 
            onClick={() => navigate("/app/dashboard")} 
            className={`flex flex-col items-center text-xs ${
              location.pathname === '/app/dashboard' || location.pathname === '/app' 
                ? 'text-primary' 
                : 'text-gray-400'
            } cursor-pointer`}
          >
            <HomeIcon className={location.pathname === '/app/dashboard' || location.pathname === '/app' ? "text-primary" : "text-gray-400"} />
            <span>Home</span>
          </button>
          <button 
            onClick={() => navigate("/app/transactions/deposit")} 
            className={`flex flex-col items-center text-xs ${
              location.pathname === '/app/transactions/deposit' 
                ? 'text-primary'
                : 'text-gray-400'
            } cursor-pointer`}
          >
            <AddGoalcon className={location.pathname === '/app/transactions/deposit' ? "text-primary" : "text-gray-400"} />
            <span>Deposit</span>
          </button>
          <button 
            onClick={() => navigate("/app/requests-approval")} 
            className={`flex flex-col items-center text-xs ${
              location.pathname === '/app/requests-approval' 
                ? 'text-primary'
                : 'text-gray-400'
            } cursor-pointer`}
          >
            <RequestsIcon className={location.pathname === '/app/requests-approval' ? "text-primary" : "text-gray-400"} />
            <span>Requests</span>
          </button>
          <button 
            onClick={() => navigate("/app/member-list")} 
            className={`flex flex-col items-center text-xs ${
              location.pathname === '/app/member-list' 
                ? 'text-primary' 
                : 'text-gray-400'
            } cursor-pointer`}
          >
            <MembersSettingsIcon className={location.pathname === '/app/member-list' ? "text-primary" : "text-gray-400"} />
            <span>Members</span>
          </button>
        </nav>
      )}
    </>
  );
}

// DESKTOP LAYOUT
if (loading) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}

if (roleError) {
  return (
    <div className="flex items-center justify-center h-screen bg-red-50">
      <div className="text-center">
        <p className="text-red-500 font-semibold">⚠️ {roleError}</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

return (
  <div className="flex min-h-screen">
    <div className="hidden lg:block">
      <Sidebar isMobile={false} />
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
        <div className="flex justify-between items-center pt-12 px-10">
          <h1 className="text-xl font-bold text-textcolor">
            {getPageTitle()}
          </h1>
          <div className="flex gap-4 items-center text-textcolor">
            <button onClick={toggleNotifDialog} className="cursor-pointer">
              <NotifyIcon className="hover:text-primary" />
            </button >
            <button className="cursor-pointer" onClick={() => navigate('/app/help-support')}>
              <SupportIcon className="hover:text-primary" />
            </button >
            <button onClick={() => navigate("/app/settings")} className="cursor-pointer">
              <SettingIcon className="hover:text-primary" />
            </button>
          </div>
        </div>
      )}

      <Outlet />
      {notifDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeNotifDialog}
          />
          <Notifications
            notifs={notifs}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />
        </>
      )}
    </main>
  </div>
);;
};

export default Layout;