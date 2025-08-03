
import { useState } from 'react';

import {
  ToggleOff as Off,
  ToggleOn as On,
  ToggleOff
} from '@mui/icons-material'


const NotificationsTab = () => {

  const [toggles, setToggles] = useState({
    reminders_push: false,
    reminders_email: false,
    reminders_sms: false,
    alerts_push: false,
    alerts_email: false,
    alerts_sms: false,
    update_push: false,
    update_email:false,
    update_sms:false,
  });

  const handleToggle = (type) => {
    setToggles((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <main className="border-accent border-2 m-4 p-4 flex flex-col gap-12">
      <h1
      className="text-xl font-medium text-primary"
      >Notifications</h1>
      
      <div className="flex flex-col gap-8 w-auto px-12">

        <section>
          <h3 className='font-semibold text-md'>
            Reminders
          </h3>
          <p className='text-xxs text-textcolor font-light'>
            These are notifications for daily reminders of important actions in the app.
          </p>
          {/* Toggle Section */}
        <div className='flex flex-col gap-4 mt-4'>
          {[
            { key: 'reminders_push', label: 'Push Notification' },
            { key: 'reminders_email', label: 'Email' },
            { key: 'reminders_sms', label: 'SMS' },
          ].map(({ key, label }) => (
            <span key={key} className='flex items-center justify-between gap-4'>
              <p className="text-xs font-medium">{label}</p>
              <button
                onClick={() => handleToggle(key)}
                className="transition-transform duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                {toggles[key] ? (
                  <On className="text-primary transition-all duration-300" fontSize="large" />
                ) : (
                  <Off className="text-gray-400 transition-all duration-300" fontSize="large" />
                )}
              </button>
            </span>
          ))}
        </div>
        </section>

        <section>
          <h3 className='font-semibold text-md'>
            Alerts
          </h3>
          <p className='text-xxs text-textcolor font-light'>
            These are notifications for deadlines, payments, and security reasons.
          </p>
          {/* Toggle Section */}
        <div className='flex flex-col gap-4 mt-4'>
          {[
            { key: 'alerts_push', label: 'Push Notification' },
            { key: 'alerts_email', label: 'Email' },
            { key: 'alerts_sms', label: 'SMS' },
          ].map(({ key, label }) => (
            <span key={key} className='flex items-center justify-between gap-4'>
              <p className="text-xs font-medium">{label}</p>
              <button
                onClick={() => handleToggle(key)}
                className="transition-transform duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                {toggles[key] ? (
                  <On className="text-primary transition-all duration-300" fontSize="large" />
                ) : (
                  <Off className="text-gray-400 transition-all duration-300" fontSize="large" />
                )}
              </button>
            </span>
          ))}
        </div>
        </section>

        <section>
          <h3 className='font-semibold text-md'>
            Updates
          </h3>
          <p className='text-xxs text-textcolor font-light'>
            These are notifications for recent updates, fixes, and features.
          </p>
          {/* Toggle Section */}
        <div className='flex flex-col gap-4 mt-4'>
          {[
            { key: 'update_push', label: 'Push Notification' },
            { key: 'update_email', label: 'Email' },
          ].map(({ key, label }) => (
            <span key={key} className='flex items-center justify-between gap-4'>
              <p className="text-xs font-medium">{label}</p>
              <button
                onClick={() => handleToggle(key)}
                className="transition-transform duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                {toggles[key] ? (
                  <On className="text-primary transition-all duration-300" fontSize="large" />
                ) : (
                  <Off className="text-gray-400 transition-all duration-300" fontSize="large" />
                )}
              </button>
            </span>
          ))}
        </div>
        </section>

        
      </div>
      

    </main>
  )
}

export default NotificationsTab