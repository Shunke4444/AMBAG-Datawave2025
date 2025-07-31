import { useState } from "react";
import Sidebar from "../components/sidebar"
import { Outlet, useLocation } from "react-router-dom"

const Layout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Check if current page should be full screen (no padding)
  const isFullScreenPage = location.pathname === '/ai-assistant';

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Only visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          isMobile={false}
        />
      </div>

      {/* Main Content */}
      <main
        className={`
          flex-1 transition-all duration-300 overflow-hidden
          ${isFullScreenPage ? '' : 'px-0 lg:px-6'}
          ${isCollapsed ? 'lg:ml-24' : 'lg:ml-64'}
          ml-0
        `}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default Layout