import { createBrowserRouter, RouterProvider }  from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssitant';
import WhatIf from './pages/WhatIf'
import Withdrawal from './pages/Withdrawal';
import Deposit from './pages/Deposit';
import TransactionHistory from './pages/TransactionHistory';
import AuditLogs from './pages/AuditLogs';
import WithdrawProcess from './pages/WithdrawProcess';
import DepositProcess from './pages/DepositProcess';

const router = createBrowserRouter([
  { path: '/' , 
    element: <Layout />,
    children: [
      {index: true, element: <Dashboard />},
      {path: 'dashboard', element: <Dashboard />},
      {path: 'transaction', element: <Transaction />},
      {path: 'goals', element: <Goals />},
      {path: 'ai-assistant', element: <AIAssistant/>},
      {path: 'what-if', element: <WhatIf/>},
      {path: 'transactions/withdrawal', element: <Withdrawal /> },
      {path: 'transactions/deposit', element: <Deposit /> },
      {path: 'transactions/history', element: <TransactionHistory /> },
      {path: 'transactions/audit', element: <AuditLogs /> },
      {path: 'transactions/withdrawalProcess', element: <WithdrawProcess /> },
      {path: 'transactions/depositProcess', element: <DepositProcess /> },  
      
      {path: 'settings', element: <Settings /> },
      {path: 'transaction-history', element: <TransactionHistory />},
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