import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  Check as GoalsIcon,
  SmartToy as AssistantIcon,
  CreditScore as LoanIcon,
  Menu as MenuIcon,
  Receipt as TransactionIcon,
} from '@mui/icons-material';
import { getAuth } from "firebase/auth";
import axios from "axios";
import useSidebar from "../../hooks/useSidebar";
import useIsMobile from "../../hooks/useIsMobile";

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/goals', label: 'Goals', icon: <GoalsIcon /> },
    { to: '/ai-assistant', label: 'AI Assistant', icon: <AssistantIcon /> },
  ];

const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [openTransactionMenu, setOpenTransactionMenu] = useState(false);
  const isUseMobile = useIsMobile();


  const handleCollapse = () => setIsCollapsed(!isCollapsed);
  const handle_Transaction_Dropdown = () => {
  if (isCollapsed) {
    setIsCollapsed(false); // Expand sidebar first
    setTimeout(() => {
      setOpenTransactionMenu(true); // Open dropdown AFTER expansion animation
    }, 500); // Match your sidebar's transition duration
  } else {
    setOpenTransactionMenu(prev => !prev); // Toggle normally if already expanded
  }
};

  useEffect(() => {
  if (isCollapsed) {
    setOpenTransactionMenu(false);
  }
}, [isCollapsed]);



  
  // ✅ Desktop layout
  return (
    <>
      {isUseMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
        
      )}
      <aside
            className={`
              bg-primary h-screen fixed top-0 left-0 p-2 transition-all duration-300 z-50
              ${isCollapsed ? "w-24" : "w-64"}
            `}
          >
            <div className="flex justify-between items-center py-5 ml-5">
              <AccountIcon className={`text-secondary ${isCollapsed ? "!hidden" : ""}`} />
              <IconButton onClick={handleCollapse}>
                <MenuIcon className="text-secondary" />
              </IconButton>
            </div>

      {!isCollapsed && <SidebarUserName />}

            <nav className="flex flex-col gap-4 mt-32 p-3">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `
                    flex items-center gap-3 rounded-xl p-3 font-bold text-sm transition-colors
                    ${isActive ? "bg-shadow text-secondary" : "text-secondary hover:bg-shadow/30"}
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  <Tooltip title={isCollapsed ? label : ""} placement="right">
                    <div>{icon}</div>
                  </Tooltip>
                  {!isCollapsed && <span>{label}</span>}
                </NavLink>
              ))}

              <List disablePadding>
                <ListItemButton
                  onClick={handle_Transaction_Dropdown}
                  className={`
                    rounded-xl py-3 px-4 text-secondary transition-all duration-300 hover:bg-shadow/30
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                >
                  <Tooltip title={isCollapsed ? "Transactions" : ""} placement="right">
                    <ListItemIcon className="min-w-0 mr-3">
                      <TransactionIcon className="text-secondary" />
                    </ListItemIcon>
                  </Tooltip>

                  {!isCollapsed && (
                    <>
                      <ListItemText disableTypography>
                        <div className="ml-3 text-sm font-bold text-secondary absolute left-10 bottom-2">
                          Transactions
                        </div>
                      </ListItemText>
                      {openTransactionMenu ? (
                        <ExpandLess className="text-secondary" />
                      ) : (
                        <ExpandMore className="text-secondary" />
                      )}
                    </>
                  )}
                </ListItemButton>

                <Collapse in={openTransactionMenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {[
                      { to: "/transactions/withdrawal", label: "Withdrawal" },
                      { to: "/transactions/deposit", label: "Deposit" },
                      { to: "/transactions/history", label: "Transaction History" },
                      { to: "/transactions/audit", label: "Audit Logs" },
                      { to: "/transactions/Balance", label: "Add Balance"}
                    ].map(({ to, label }) => (
                      <ListItemButton
                        key={to}
                        component={NavLink}
                        to={to}
                        className={`
                          pl-14 py-2 text-secondary hover:bg-shadow/30 transition-all duration-200 text-sm font-bold
                          ${isCollapsed ? "hidden" : ""}
                        `}
                      >
                        <span className="text-secondary font-bold text-xs">{label}</span>
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </List>
            </nav>
          </aside>
    </>
    
  );
};

function SidebarUserName() {
  const [firstName, setFirstName] = useState("");
  useEffect(() => {
    const fetchFirstName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return setFirstName("");
      const token = await user.getIdToken();
      const firebase_uid = user.uid;
      const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";
      const res = await axios.get(`${baseURL}/users/profile/${firebase_uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFirstName(res?.data?.profile?.first_name || "User");
    };
    fetchFirstName();
  }, []);
  return (
    <h1 className={`text-secondary text-xl font-semibold`}>
      Welcome, <span className="text-accent">{firstName || "User"}!</span>
    </h1>
  );
}

export default Sidebar;


