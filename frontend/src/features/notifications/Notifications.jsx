// Notifications.js
import  { forwardRef } from 'react';

const Notifications = forwardRef(({ notifs, onApprove, onDecline }, ref) => {
  return (
    <div
      ref={ref}
      className="fixed top-20 right-6 bg-white shadow-lg rounded-lg w-80 max-h-96 overflow-y-auto z-50"
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>
      <div className="p-4 space-y-4">
        {notifs.length === 0 && (
          <p className="text-gray-500 text-sm">No notifications</p>
        )}
        {notifs.map((notif) => (
          <div key={notif.id} className="border rounded p-2">
            <p className="font-medium">{notif.title}</p>
            <p className="text-sm text-gray-600">{notif.details}</p>
            <p className="text-xs text-gray-400">
              {notif.date} at {notif.time}
            </p>
            {notif.type === 'request' && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onApprove(notif)}
                  className="text-green-600 border border-green-600 px-2 py-1 text-xs rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(notif)}
                  className="text-red-600 border border-red-600 px-2 py-1 text-xs rounded"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default Notifications;
