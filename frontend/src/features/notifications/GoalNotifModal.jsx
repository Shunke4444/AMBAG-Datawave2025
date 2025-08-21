import React from 'react';

export default function GoalNotifModal({ notification, open, onClose, onAction }) {
  if (!open || !notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close notification modal"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-2">{notification.title || 'Notification'}</h2>
        <p className="text-sm text-gray-700 mb-4">{notification.message}</p>
        <div className="text-xs text-gray-500 mb-4">
          {notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}
        </div>
        {/* Render action buttons if provided */}
        {notification.hasActions && (
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-2 bg-primary text-secondary rounded-lg text-xs font-medium hover:bg-shadow"
              onClick={() => onAction('requestLoanFromMembers', notification.id)}
            >
              Ask Members
            </button>
            <button
              className="px-3 py-2 bg-accent text-primary rounded-lg text-xs font-medium hover:bg-accent/90"
              onClick={() => onAction('requestBPILoan', notification.id)}
            >
              BPI Loan
            </button>
            <button
              className="px-3 py-2 bg-textcolor/10 text-textcolor rounded-lg text-xs font-medium hover:bg-textcolor/20"
              onClick={() => onAction('dismissSuggestion', notification.id)}
            >
              Not Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
