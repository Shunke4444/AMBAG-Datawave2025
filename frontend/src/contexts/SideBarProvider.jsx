import { useState } from "react";
import  SidebarContext  from "./SiderbarContext"; // ✅ use { } here

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullScreenPage, setIsFullScreenPage] = useState(false); // ✅ new state

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, setIsCollapsed, isFullScreenPage, setIsFullScreenPage }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
