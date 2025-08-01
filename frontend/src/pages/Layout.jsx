import { useState } from "react";
import Sidebar from "../components/sidebar";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

const Layout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Check if current page should be full screen (no padding)
  const isFullScreenPage = location.pathname === '/ai-assistant';
  
    const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("goals")) return "Goals";
    if (path.includes("settings")) return "Settings";
    if (path.includes("withdrawal")) return "Withdrawal";
    if (path.includes("deposit")) return "Deposit";
    if (path.includes("transactions")) return "Transactions";
    if (path.includes("ai-assistant")) return "AI Assistant";
    return "Welcome";
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={false}
        />
      </div>

      {/* Main */}
      <main
        className={`
          flex-1 transition-all duration-300 overflow-hidden
          ${isFullScreenPage ? "" : "px-0 lg:px-6"}
          ${isCollapsed ? "lg:ml-24" : "lg:ml-64"}
          ml-0
        `}
      >
        {/* Global Top Header */}
        {!isFullScreenPage && (
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
      </main>
    </div>
  )
}

export default Layout