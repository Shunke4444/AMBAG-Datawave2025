import React from 'react';

/**
 * Notification toast for nudge confirmations
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {boolean} props.visible - Whether notification is visible
 */
const NudgeNotification = ({ message, visible }) => {
  if (!visible || !message) return null;

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-4 py-2 rounded-lg shadow-lg"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

export default NudgeNotification;
