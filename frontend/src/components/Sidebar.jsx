import { useState } from 'react';
import { NavLink } from 'react-router-dom'
import {
  AccountCircle as AccountIcon,
  DashboardRounded as DashboardIcon,
  ReceiptRounded as TransactionIcon,
  CheckCircleRounded as GoalsIcon,
  SmartToyRounded as AssistantIcon,
  CreditScoreRounded as LoanIcon,
  MenuRounded as MenuIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip, List, ListSubheader, ListItemIcon, ListItemText, Collapse, ListItemButton} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Typography from '@mui/material/Typography';


import { Waves } from '../assets/images';

const Sidebar = ({isCollapsed, setIsCollapsed, isMobile = false, onMobileClose}) => {
  
  const [openTransactionMenu, setOpenTransactionMenu] = useState(false); 

  const handle_Transaction_Dropdown = () => {
    setOpenTransactionMenu(!openTransactionMenu);
  }

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  }

  // Handle mobile link clicks
  const handleMobileLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }

  const navItems = [
    {to:'/dashboard', label:'Dashboard' , icon:<DashboardIcon/>},
    {to:'/goals', label:'Goals' , icon:<GoalsIcon/>},
    {to:'/ai-assistant' , label:'AI Assistant' , icon:<AssistantIcon/> },
    {to:'/takeALoan' , label:'Take a Loan?' , icon:<LoanIcon/> }
  ]
  

  return (
    <>
<<<<<<< HEAD
    <aside className={`bg-primary  h-screen fixed top-0 left-0 p-2 transition-all duration-300 z-10 ${isCollapsed ? "w-24" : "w-64"}`}>
=======
    <aside className={`
      bg-primary h-screen fixed top-0 left-0 p-2 transition-all duration-300 z-50 
      ${isCollapsed ? "w-24" : "w-64"}
      ${isMobile ? 'lg:relative lg:top-auto' : ''}
    `}>
>>>>>>> upstream/main

      {/** profile and menu btn */}
      <div className="flex justify-between items-center py-5 ml-5">
        <AccountIcon className={`text-secondary ${isCollapsed ? "!hidden" : "" }`}/>
        <IconButton 
          size='large' 
          edge='start'
          color='inherit'
          aria-label='menu'
          onClick={handleCollapse}>
          <MenuIcon className='text-secondary'/>
        </IconButton>
        
      </div>
      <h1 className={`text-secondary text-xl font-semibold 
        ${isCollapsed ? "hidden" : "" }`}
        >
          Welcome, <span className='text-accent'>User!</span>
      </h1>

      {/** NavLinks, Rendering the NavLinks List in navItems array using map() */}
      <nav className="flex flex-col gap-4 mt-32 p-3">
        {navItems.map(({to, label, icon}) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleMobileLinkClick}
            className={({isActive}) => `
              flex items-center gap-3 rounded-xl p-3 font-bold text-sm transition-colors
              ${isActive ? 'bg-shadow text-secondary' : 'text-secondary hover:bg-shadow/30'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >

            <Tooltip title={isCollapsed ? label: ''} placement='right'>
              <div>{icon}</div>
            </Tooltip>
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
          ))}

        
      {/* Transactions Dropdown */}

        <List component="NavLink" disablePadding>
          <ListItemButton
            onClick={handle_Transaction_Dropdown}
            className={`
              rounded-xl py-3 px-4 text-secondary transition-all duration-300 hover:bg-shadow/30 
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <Tooltip title={isCollapsed ? 'Transactions' : ''} placement="right">
              <ListItemIcon className="min-w-0 mr-3">
                <TransactionIcon className="text-secondary" />
              </ListItemIcon>
            </Tooltip>

            {!isCollapsed && (
              <>
                <ListItemText disableTypography>
                  <div className="ml-3 text-sm font-bold text-secondary absolute left-10 bottom-2 ">
                    Transactions
                  </div>
                </ListItemText>


                {openTransactionMenu ? <ExpandLess className='text-secondary'/> : <ExpandMore className='text-secondary' />}
              </>
            )}
          </ListItemButton>
          
          {/* Nested Transaction Options */}
          <Collapse in={openTransactionMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {[
                { to: '/transactions/withdrawal', label: 'Withdrawal' },
                { to: '/transactions/deposit', label: 'Deposit' },
                { to: '/transactions/history', label: 'Transaction History' },
                { to: '/transactions/audit-logs', label: 'Audit Logs' },
              ].map(({ to, label }) => (
                <ListItemButton
                  key={to}
                  component={NavLink}
                  to={to}
                  onClick={handleMobileLinkClick}
                  className={`pl-14 py-2 text-secondary hover:bg-shadow/30 transition-all duration-200 text-sm font-bold ${
                    isCollapsed ? 'hidden' : ''
                  }`}
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
  )
}

export default Sidebar