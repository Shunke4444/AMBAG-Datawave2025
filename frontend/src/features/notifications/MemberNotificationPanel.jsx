import React from 'react';
import MemberNotificationItem from './MemberNotificationItem';

const MemberNotificationPanel = ({ notifications }) => (
  <div className="max-w-4xl mx-auto">
    {notifications.map((section, sectionIndex) => (
      <section key={sectionIndex} className="mb-6 sm:mb-8" aria-labelledby={`section-${sectionIndex}`}> 
        {/* Section Header */}
        <header className="flex items-center gap-2 mb-4">
          <h2 id={`section-${sectionIndex}`} className="text-sm sm:text-base font-semibold text-secondary/80">{section.section}</h2>
          <div className="flex-1 h-px bg-secondary/20" aria-hidden="true"></div>
        </header>
        <ul className="space-y-3 sm:space-y-4" role="list">
          {section.items.map((notification, idx) => (
            <li key={notification.id} className="relative">
              {/* Gold dot indicator for new notifications */}
              {notification.isNew && (
                <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-yellow-400 border-2 border-white shadow" />
              )}
              <MemberNotificationItem notification={notification} />
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default MemberNotificationPanel;
