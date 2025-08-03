import { useState } from 'react';
import {ToggleOff as Off, ToggleOn as On} from '@mui/icons-material'

const PreferencesTab = () => {
  const [language, setLanguage] = useState('en');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [autoLogin, setAutoLogin] = useState(true);
  
  const handleToggle = () => {
    setAutoLogin(prev => !prev);
  };

  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-12">
      <h1 className="text-xl font-medium text-primary">App Preferences</h1>

      <div className="flex flex-col gap-8 w-full px-12">

        {/* Language Preference */}
        <section className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border p-2 rounded w-60"
          >
            <option value="en">English</option>
            <option value="ph">Filipino</option>
            <option value="es">Spanish</option>
          </select>
        </section>

        {/* Time Format Preference */}
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold text-md">Time and Date</h3>

          <label className="font-semibold text-sm">Time Format</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={timeFormat === '12h'}
                onChange={() => setTimeFormat('12h')}
              />
              12-Hour
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={timeFormat === '24h'}
                onChange={() => setTimeFormat('24h')}
              />
              24-Hour
            </label>
          </div>
        </section>

         {/* Stay Signed In Toggle */}
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold text-md">Stay Signed In</h3>
          <p className="text-xxs text-textcolor font-light">
            Keep your account signed in after closing the browser.
          </p>
          <div className="flex items-center justify-between w-60 mt-2">
            <p className="text-sm">Enable Auto Login</p>
            <button
              onClick={handleToggle}
              className="transition-transform duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              {autoLogin ? (
                <On className="text-primary transition-all duration-300" fontSize="large" />
              ) : (
                <Off className="text-gray-400 transition-all duration-300" fontSize="large" />
              )}
            </button>
          </div>
        </section>

      </div>
    </main>
  );
};

export default PreferencesTab;
