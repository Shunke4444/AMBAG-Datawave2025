import { useState , useEffect} from "react";
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
import MobileHeader from "../../components/MobileHeader";// import { useAuthRole } from "../../contexts/AuthRoleContext";
import useSidebar from "../../hooks/useSidebar";

const authRole = "Manager";
const notifs = authRole === "Manager" ? ManagerNotifs : MemberNotifs;

const Layout = () => {
  const { isCollapsed, setIsFullScreenPage } = useSidebar();
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isUseMobile = useIsMobile();

  const isFullScreenPage = location.pathname === '/ai-assistant' || 
                        location.pathname.includes('/payment') || 
                        location.pathname.includes('/confirm') || 
                        location.pathname.includes('/receipt') ||
                        location.pathname.includes('/what-if') ||
                        (location.pathname.includes('/request') && !location.pathname.includes('requests-approval')) ||
                        location.pathname.includes('member-requests') ||
                        location.pathname.includes('notification');
  const shouldHideHeader = isFullScreenPage || isMobile;

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

  // MOBILE LAYOUT
  if (isUseMobile) {
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
        {!isFullScreenPage && authRole === "Manager" && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-t-gray-300 rounded-tl-3xl rounded-tr-3xl shadow-md flex justify-around py-2 z-50">
            <button 
              onClick={() => navigate("/dashboard")} 
              className={`flex flex-col items-center text-xs ${
                location.pathname === '/dashboard' || location.pathname === '/' 
                  ? 'text-primary' 
                  : 'text-gray-400'
              }cursor-pointer`}
            >
              <HomeIcon className={location.pathname === '/dashboard' || location.pathname === '/' ? "text-primary" : "text-gray-400"} />
              <span>Home</span>
            </button>
            <button 
              onClick={() => navigate("/requests-approval")} 
              className={`flex flex-col items-center text-xs ${
                location.pathname === '/requests-approval' 
                  ? 'text-primary'
                  : 'text-gray-400'
              } cursor-pointer`}
            >
              <RequestsIcon className={location.pathname === '/requests-approval' ? "text-primary" : "text-gray-400"} />
              <span>Requests</span>
            </button>
            <button 
              onClick={() => navigate("/member-list")} 
              className={`flex flex-col items-center text-xs ${
                location.pathname === '/member-list' 
                  ? 'text-primary' 
                  : 'text-gray-400'
              } cursor-pointer`}
            >
              <MembersSettingsIcon className={location.pathname === '/member-list' ? "text-primary" : "text-gray-400"} />
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
              <button onClick={toggleNotifDialog} className="cursor-pointer">
                <NotifyIcon className="hover:text-primary" />
              </button >
              <button className="cursor-pointer" onClick={() => navigate('/help-support')}>
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
  );
};

export default Layout;