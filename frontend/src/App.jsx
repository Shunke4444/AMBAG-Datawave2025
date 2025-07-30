import { createBrowserRouter, RouterProvider }  from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssitant';
import WhatIf from './pages/WhatIf'

const router = createBrowserRouter([
  { path: '/' , 
    element: <Layout />,
    children: [
      {path: 'dashboard', element: <Dashboard />},
      {path: 'transaction', element: <Transaction />},
      {path: 'goals', element: <Goals />},
      {path: 'ai-assistant', element: <AIAssistant/>},
      {path: 'what-if', element: <WhatIf/>},
      {path: 'settings', element: <Settings /> }
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