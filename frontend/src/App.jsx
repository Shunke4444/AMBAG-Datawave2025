import { createBrowserRouter, RouterProvider }  from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/layout/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssitant';
import WhatIf from './pages/WhatIf'
import Withdrawal from './pages/Withdrawal';
import Deposit from './pages/Deposit';
import TransactionHistory from './pages/TransactionHistory';
import MemberPage from './pages/MemberPage';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import WithdrawForm from './pages/WithdrawForm';
import DepositForm from './pages/DepositForm';
import ProfileTab from './components/ProfileTab';
import AccountSecurityTab from './components/AccountSecurityTab';
import PreferencesTab from './components/PreferencesTab';
import PrivacyLegalTab from './components/PrivacyLegalTab';
import NotificationsTab from './components/NotificationsTab';
import Payment from './pages/PaymentPageFlow/Payment';
import Request from './pages/MemberRequest/Request'
import ConfirmPay from './pages/PaymentPageFlow/ConfirmPay';
const router = createBrowserRouter([
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
    // add children later
  },
  // Main App with Layout
  { path: '/' , 
    element: <Layout />,
    children: [
      {index: true, element: <Dashboard />},
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
      {path: 'notifications', element: <Notifications />},
      {path: 'member-requests', element: <Request />},
      {path: 'payment', element: <Payment />},
      {path: 'payment/confirm', element: <ConfirmPay />},
      {path: 'settings', element: <Settings />,
        children: [
          { index: true, element: <ProfileTab /> }, // /settings
          { path: "account-security", element: <AccountSecurityTab /> },
          { path: "notifications", element: <NotificationsTab /> },
          { path: "preferences", element: <PreferencesTab /> },
          { path: "privacy-legal", element: <PrivacyLegalTab /> },
        ]
      },
    ],
  },
])

const App = () => {
  return (
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  )
}
export default App