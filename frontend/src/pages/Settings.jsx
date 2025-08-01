import { NavLink, Outlet } from 'react-router-dom';
import ProfileTab from '../components/ProfileTab';
import AccountSecurityTab from '../components/AccountSecurityTab';
import PreferencesTab from '../components/PreferencesTab';
import PrivacyLegal from '../components/PrivacyLegalTab';


const TABS = [
  'Profile',
  'Account & Security',
  'Preferences',
  'PrivacyLegal'
];

const Settings = () => {
  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-center">
      
      {/* Settings Tabs */}
      <div>
        <NavLink>

        </NavLink>
        <NavLink>

        </NavLink>
        <NavLink>
          
        </NavLink>
        <NavLink>

        </NavLink>
      </div>
      <Outlet/>
    </main>
  )
}

export default Settings