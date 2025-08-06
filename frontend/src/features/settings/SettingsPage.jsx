import { NavLink, Outlet } from 'react-router-dom';
import ProfileTab from './ProfileTab';
import AccountSecurityTab from './AccountSecurityTab';
import PreferencesTab from './PreferencesTab';
import PrivacyLegal from './PrivacyLegalTab';

import {
  InputLabel,
  MenuItem,
  FormControl,
  Select,

} from '@mui/material';

const TABS = [
  'Profile',
  'Account & Security',
  'Preferences',
  'PrivacyLegal'
];

const Settings = () => {
  return (
    <main className="flex flex-col w-full h-full min-h-screen">
      
      {/* Settings Tabs */}
      <nav className='flex w-fit mx-auto my-8 p-4 rounded-3xl shadow-md gap-8 bg-primary/10'> 
          <NavLink
          to=''
          end
          className={({isActive}) => 
          isActive 
          ? "text-primary outline-1 outline-primary bg-secondary p-2 rounded-2xl font-bold shadow-2xl"
          : "text-secondary bg-primary rounded-2xl font-bold shadow-2xl p-2"
          }
          >
            Profile
          </NavLink>

          <NavLink
          to='account-security'
          className={({isActive}) => 
          isActive 
          ? "text-primary outline-1 outline-primary bg-secondary p-2 rounded-2xl font-bold shadow-2xl"
          : "text-secondary bg-primary rounded-2xl font-bold shadow-2xl p-2"
          }
          >
            Account & Security
          </NavLink>

          <NavLink
          to='notifications'
          className={({isActive}) => 
          isActive 
          ? "text-primary outline-1 outline-primary bg-secondary p-2 rounded-2xl font-bold shadow-2xl"
          : "text-secondary bg-primary rounded-2xl font-bold shadow-2xl p-2"
          }
          >
            Notifications
          </NavLink>

          <NavLink
          to='preferences'
          className={({isActive}) => 
          isActive 
          ? "text-primary outline-1 outline-primary bg-secondary p-2 rounded-2xl font-bold shadow-2xl"
          : "text-secondary bg-primary rounded-2xl font-bold shadow-2xl p-2"
          }
          >
            Preferences
          </NavLink>
          
          <NavLink
          to='privacy-legal'
          className={({isActive}) => 
          isActive 
          ? "text-primary outline-1 outline-primary bg-secondary p-2 rounded-2xl font-bold shadow-2xl"
          : "text-secondary bg-primary rounded-2xl font-bold shadow-2xl p-2"
          }
          >
            Privacy & Legal
          </NavLink>
      </nav>

      <Outlet/>
    </main>
  )
}

export default Settings