import { createBrowserRouter, RouterProvider }  from 'react-router-dom';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Transaction from './pages/Transaction';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  { path: '/' , 
    element: <Layout />,
    children: [
      {path: 'dashboard', element: <Dashboard />},
      {path: 'transaction', element: <Transaction />},
      {path: 'goals', element: <Goals />},
      {path: 'settings', element: <Settings /> }
    ],
  },
])

const App = () => {
  return <RouterProvider router={router} />
}
export default App