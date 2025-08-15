import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { label: 'Profile', to: '' },
  { label: 'Account & Security', to: 'account-security' },
  { label: 'Notifications', to: 'notifications' },
  { label: 'Preferences', to: 'preferences' },
  { label: 'Privacy & Legal', to: 'privacy-legal' },
];

const Settings = () => {


  return (
    <main className="flex flex-col w-full h-full min-h-screen px-4">
      
      {/* Settings Tabs */}
      <nav className={`flex flex-wrap justify-center gap-2 my-4 p-2 rounded-3xl shadow-md bg-primary/10`}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === ''}
            className={({ isActive }) =>
              `
              text-center font-bold rounded-2xl shadow-md transition-all
              ${isActive 
                ? "text-primary bg-secondary" 
                : "text-secondary bg-primary"
              }
              px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm md:px-4 md:py-2 md:text-base
              `
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </main>
  );
};

export default Settings;
