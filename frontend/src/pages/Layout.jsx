import { useState } from "react";
import Sidebar from "../components/sidebar"
import { Outlet } from "react-router-dom"

const Layout = () => {

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex ">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`transition-all duration-300 flex-1 p-6 ${
          isCollapsed ? 'ml-24' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default Layout