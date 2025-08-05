
import { useState } from "react";
import { NavLink, useNavigate} from "react-router-dom";
import { Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import useIsMobile from "../hooks/useIsMobile"; 
import {
  AccountCircle as AccountIcon,
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
  Dashboard as DashboardIcon,
  Check as GoalsIcon,
  SmartToy as AssistantIcon,
  CreditScore as LoanIcon,
  Menu as MenuIcon,
  Receipt as TransactionIcon,
} from '@mui/icons-material';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/goals', label: 'Goals', icon: <GoalsIcon /> },
    { to: '/ai-assistant', label: 'AI Assistant', icon: <AssistantIcon /> },
    { to: '/takeALoan', label: 'Take a Loan?', icon: <LoanIcon /> }
  ];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate(); // ✅ Call at top
  const isMobile = useIsMobile(); // ✅ Call at top

  const [openTransactionMenu, setOpenTransactionMenu] = useState(false);

  const handleCollapse = () => setIsCollapsed(!isCollapsed);
  const handleMobileLinkClick = () => {
    if (isMobile) setIsCollapsed(true); // Optional behavior for mobile nav
  };
  const handle_Transaction_Dropdown = () => {
    setOpenTransactionMenu(!openTransactionMenu);
  };

  // ✅ If mobile, render simplified top bar
  if (isMobile) {
    return (
      <div className="flex justify-between items-center p-4 bg-primary">
        <p className="text-md font-semibold text-secondary">
          Hello <span className="text-yellow-400 font-bold">User!</span>
        </p>
        <div className="flex gap-4">
          <button className="cursor-pointer">
            <NotifyIcon className="text-secondary"/>
          </button>
          <button onClick={() => navigate("/help-support")} className="cursor-pointer">
            <SupportIcon className="text-secondary" />
          </button>
          <button onClick={() => navigate("/settings")} className="cursor-pointer">
            <SettingIcon className="text-secondary" />
          </button>
        </div>
      </div>
    );
  }

  // ✅ Desktop layout
  return (
    <aside
      className={`
        bg-primary h-screen fixed top-0 left-0 p-2 transition-all duration-300 z-50
        ${isCollapsed ? "w-24" : "w-64"}
        ${isMobile ? "lg:relative lg:top-auto" : ""}
      `}
    >
      <div className="flex justify-between items-center py-5 ml-5">
        <AccountIcon className={`text-secondary ${isCollapsed ? "!hidden" : ""}`} />
        <IconButton onClick={handleCollapse}>
          <MenuIcon className="text-secondary" />
        </IconButton>
      </div>

      <h1 className={`text-secondary text-xl font-semibold ${isCollapsed ? "hidden" : ""}`}>
        Welcome, <span className="text-accent">User!</span>
      </h1>

      <nav className="flex flex-col gap-4 mt-32 p-3">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleMobileLinkClick}
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
              ].map(({ to, label }) => (
                <ListItemButton
                  key={to}
                  component={NavLink}
                  to={to}
                  onClick={handleMobileLinkClick}
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
  );
};

export default Sidebar;


