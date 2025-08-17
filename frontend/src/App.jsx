import { createBrowserRouter, RouterProvider }  from 'react-router-dom';
import ChatProvider from './contexts/ChatProvider';
import  AuthRoleProvider  from './contexts/AuthRoleProvider';
import Layout from './shared/layout/Layout';
import Login from './features/auth/LoginPage';
import Signup from './features/auth/SignupPage';
import Dashboard from './features/dashboard/DashboardPage';
import Goals from './features/goals/GoalsPage';
import Settings from './features/settings/SettingsPage';
import AIAssistant from './features/ai-assistant/AIAssistantPage';
import WhatIf from './features/what-if/WhatIfPage'
import Withdrawal from './features/transactions/WithdrawalPage';
import Deposit from './features/transactions/DepositPage';
import TransactionHistory from './features/transactions/TransactionHistoryPage';
import MemberPage from './features/members/MemberPage';
import ManagerNotifications from './features/notifications/ManagerNotificationPage';
import AuditLogs from './features/transactions/AuditLogsPage';
import WithdrawForm from './features/transactions/WithdrawForm';
import DepositForm from './features/transactions/DepositForm';
import ProfileTab from './features/settings/ProfileTab';
import AccountSecurityTab from './features/settings/AccountSecurityTab';
import PreferencesTab from './features/settings/PreferencesTab';
import PrivacyLegalTab from './features/settings/PrivacyLegalTab';
import NotificationsTab from './features/notifications/NotificationsTab';
import Payment from './features/payments/PaymentPage';
import Request from './features/members/RequestPage'
import ConfirmPay from './features/payments/ConfirmPayPage';
import Receipt from './features/payments/ReceiptPage';
import HelpSupport from './features/help-support/HelpSupportPage';
import MemberNotification from './features/notifications/MemberNotificationPage';
import MemberRequestApproval from './features/manager/MemberRequestApproval'
import MemberList from './features/manager/MemberList';
import { OnboardingWrapper } from './features/on-boarding';
import NewUserDashboard from './features/dashboard/NewUserDashboard';
import { SidebarProvider } from "./contexts/SideBarProvider";
import ApprovalsPage from './features/approvals/ApprovalsPage';
import { useEffect } from 'react';
import { MembersProvider } from './features/manager/contexts/MembersContext.jsx';

const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <OnboardingWrapper />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/member',
    element: <MemberPage />
  },
  {
    path: '/payment',
    element: <Payment />
  },
  {
    path: '/new-user-dashboard',
    element: <NewUserDashboard/>
  },

  // Main App with Layout
  { path: '/' , 
    element: <Layout />,
    children: [
  // {index: true, element: <Dashboard />},
      {path: 'dashboard', element: <Dashboard />},
      {path: 'goals', element: <Goals />},
      {path: 'ai-assistant', element: <AIAssistant/>},
      {path: 'what-if', element: <WhatIf/>},
      {path: 'transactions/withdrawal', element: <Withdrawal /> },
      {path: 'transactions/deposit', element: <Deposit /> },
      {path: 'transactions/history', element: <TransactionHistory /> },
      {path: 'transactions/audit', element: <AuditLogs /> },
      {path: 'transactions/withdrawalProcess', element: <WithdrawForm /> },
      {path: 'transactions/depositProcess', element: <DepositForm /> },  
      {path: 'transaction-history', element: <TransactionHistory />},
      {path: 'manager-notifications', element: <ManagerNotifications />},
      {path: 'member-requests', element: <Request />},
      {path: 'requests', element: <Request />},
      {path: 'payment', element: <Payment />},
      {path: 'payment/confirm', element: <ConfirmPay />},
      {path: 'receipt', element: <Receipt />},
      {path: 'member-notification', element: <MemberNotification />},
      {path: 'requests-approval', element: <MemberRequestApproval />},
      {path: 'member-list', element: <MemberList />},
      {path: 'approvals', element: <ApprovalsPage />},

      
      {path: 'settings', element: <Settings />,
        children: [
          { index: true, element: <ProfileTab /> }, // /settings
          { path: "account-security", element: <AccountSecurityTab /> },
          { path: "notifications", element: <NotificationsTab /> },
          { path: "preferences", element: <PreferencesTab /> },
          { path: "privacy-legal", element: <PrivacyLegalTab /> },
        ]
      },
      {path: 'help-support', element: <HelpSupport /> },
    ],
  },
])


const App = () => {
  useEffect(() => {
    const token = localStorage.getItem('authRole');
    if (!token && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
      window.location.replace('/login');
    }
  }, []);
  return (
    <AuthRoleProvider>
      <ChatProvider>
        <SidebarProvider>
          <MembersProvider>
            <RouterProvider router={router} />
          </MembersProvider>
        </SidebarProvider>
      </ChatProvider>
    </AuthRoleProvider>
  );
}
export default App