import React, { useState, useEffect } from 'react';
import AgenticReminderCard from './AgenticReminderCard.jsx';
import WelcomeNotificationCard from '../../components/WelcomeNotificationCard.jsx';
import { useNavigate } from 'react-router-dom';
import { fetchAgenticNotifications, fetchSmartReminders } from '../../lib/api';
import { useMembersContext } from '../manager/contexts/MembersContext.jsx';
import { Notifications} from '@mui/icons-material';
import MobileLayout from '../payments/PaymentLayout';

export default function ManagerNotifications({ goalId }) {
  const navigate = useNavigate();
  const [actionNotifications, setActionNotifications] = useState({
    loan_suggestion: null
  });
  const [notifications, setNotifications] = useState([]);
  const [oldNotifications, setOldNotifications] = useState([]);
  const [agenticNotifications, setAgenticNotifications] = useState([]);
  const { currentUser } = useMembersContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Use groupId from MembersContext if goalId is not provided
  const { groupId } = useMembersContext();
  const effectiveGoalId = goalId || groupId;

  useEffect(() => {
    async function loadNotifications() {
      if (!currentUser) {
        setLoading(true);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Standard notifications
        const firebaseUid = currentUser?.firebase_uid || null;
        const res = await fetchAgenticNotifications(effectiveGoalId);
        const allNotifs = res.notifications || [];
  const filtered = firebaseUid ? allNotifs.filter(n => n.recipient === firebaseUid || n.recipient === currentUser?.user_id) : allNotifs;
  console.log('Filtered notifications for member:', filtered);
        const sorted = [...filtered].sort((a, b) => {
          const ta = new Date(a.timestamp || a.created_at || 0).getTime();
          const tb = new Date(b.timestamp || b.created_at || 0).getTime();
          return tb - ta;
        });
  setNotifications(sorted);
  setOldNotifications([]); // Reset old notifications on reload

        // Agentic notifications (smart reminders)
  console.log('Fetching agentic reminders with ID:', effectiveGoalId);
  const agenticRes = await fetchSmartReminders(effectiveGoalId);
        // Filter for current group and auto_send true
        const agenticFiltered = (agenticRes.reminders || []).filter(r => r.group_id === effectiveGoalId && r.auto_send);
        // Sort by timestamp
        const agenticSorted = [...agenticFiltered].sort((a, b) => {
          const ta = new Date(a.timestamp || 0).getTime();
          const tb = new Date(b.timestamp || 0).getTime();
          return tb - ta;
        });
        setAgenticNotifications(agenticSorted);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('[DEBUG] Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [effectiveGoalId, currentUser]);

  // Notification Action Handlers - AI accessible functions
  const notificationActions = {
    // Loan suggestion actions
    requestLoanFromMembers: async (notificationId) => {
      try {
        // Backend API call would go here
        console.log('Requesting loan from members for notification:', notificationId);
        setActionNotifications(prev => ({
          ...prev,
          loan_suggestion: 'member'
        }));
        // Return success response for AI
        return { success: true, action: 'member_loan_requested', notificationId };
      } catch (error) {
        console.error('Error requesting loan from members:', error);
        return { success: false, error: error.message };
      }
    },

    requestBPILoan: async (notificationId) => {
      try {
        // Backend API call would go here
        console.log('Initiating BPI loan application for notification:', notificationId);
        setActionNotifications(prev => ({
          ...prev,
          loan_suggestion: 'bpi'
        }));
        return { success: true, action: 'bpi_loan_initiated', notificationId };
      } catch (error) {
        console.error('Error initiating BPI loan:', error);
        return { success: false, error: error.message };
      }
    },

    dismissSuggestion: async (notificationId) => {
      try {
        // Backend API call would go here
        console.log('Dismissing suggestion for notification:', notificationId);
        setActionNotifications(prev => ({
          ...prev,
          loan_suggestion: 'reject'
        }));
        return { success: true, action: 'suggestion_dismissed', notificationId };
      } catch (error) {
        console.error('Error dismissing suggestion:', error);
        return { success: false, error: error.message };
      }
    },

    // Generic notification actions
    markAsRead: async (notificationId) => {
      try {
        // Backend API call would go here
        console.log('Marking notification as read:', notificationId);
        return { success: true, action: 'marked_as_read', notificationId };
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, error: error.message };
      }
    },

    snoozeNotification: async (notificationId, duration = '1hour') => {
      try {
        // Backend API call would go here
        console.log('Snoozing notification:', notificationId, 'for', duration);
        return { success: true, action: 'notification_snoozed', notificationId, duration };
      } catch (error) {
        console.error('Error snoozing notification:', error);
        return { success: false, error: error.message };
      }
    }
  };

  // Notification Type Configurations
  const notificationTypes = {
    ai_nudge: {
      style: 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 bg-secondary',
      priority: 'medium',
      actions: ['markAsRead', 'snoozeNotification'],
      aiAccessible: true
    },
    ai_suggestion: {
      style: 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 bg-secondary',
      priority: 'high',
      actions: ['requestLoanFromMembers', 'requestBPILoan', 'dismissSuggestion'],
      aiAccessible: true
    },
    goal_completed: {
      style: 'bg-gradient-to-r from-green/10 to-green/5 border-green/20 bg-secondary',
      priority: 'low',
      actions: ['markAsRead'],
      aiAccessible: false
    },
    achievement: {
      style: 'bg-gradient-to-r from-green/10 to-green/5 border-green/20 bg-secondary',
      priority: 'low',
      actions: ['markAsRead'],
      aiAccessible: false
    },
    reminder: {
      style: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 bg-secondary',
      priority: 'high',
      actions: ['markAsRead', 'snoozeNotification'],
      aiAccessible: true
    },
    default: {
      style: 'bg-secondary border-textcolor/10',
      priority: 'low',
      actions: ['markAsRead'],
      aiAccessible: false
    }
  };

  // Helper function to get notification configuration
  const getNotificationConfig = (type) => {
    return notificationTypes[type] || notificationTypes.default;
  };

  // Handler for executing notification actions
  const handleNotificationAction = async (actionName, notificationId, ...params) => {
    if (notificationActions[actionName]) {
      const result = await notificationActions[actionName](notificationId, ...params);
      console.log('Action result:', result);
      // If paid or snoozed, move to old notifications
      if (['notification_snoozed', 'marked_as_read'].includes(result.action)) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId && n._id !== notificationId));
        setOldNotifications(prev => [
          ...prev,
          ...notifications.filter(n => n.id === notificationId || n._id === notificationId)
        ]);
      }
      return result;
    } else {
      console.error('Unknown action:', actionName);
      return { success: false, error: 'Unknown action' };
    }
  };

  // Render
  // Helper to categorize notifications by date
  const categorizeNotifications = (notifs) => {
    const today = [];
    const yesterday = [];
    const old = [];
    const now = new Date();
    notifs.forEach(n => {
      const ts = new Date(n.timestamp || n.created_at || 0);
      const diff = (now - ts) / (1000 * 60 * 60 * 24);
      if (diff < 1 && ts.getDate() === now.getDate()) {
        today.push(n);
      } else if (diff < 2 && ts.getDate() === now.getDate() - 1) {
        yesterday.push(n);
      } else {
        old.push(n);
      }
    });
    return { today, yesterday, old };
  };

  const { today, yesterday, old } = categorizeNotifications(notifications);

  return (
  <MobileLayout title="Notifications">
      <section className="pt-6 pb-6 bg-primary" aria-label="Notifications">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : error ? (
            <div className="text-center py-8 text-red">{error}</div>
          ) : (
            <>
              {/* Agentic Notifications Section */}
              {(() => {
                if (!agenticNotifications || agenticNotifications.length === 0) return null;
                return (
                  <section className="mb-8" aria-label="Agentic Notifications">
                    <h2 className="text-lg font-bold text-whit mb-4">Agentic Reminders</h2>
                    <ul className="space-y-3 sm:space-y-4" role="list">
                      {agenticNotifications.map(reminder => (
                        <li key={reminder.id || reminder._id}>
                          <AgenticReminderCard 
                            reminder={reminder}
                            onPayShare={(goalId) => {
                              const goalName = reminder?.goal_name || reminder?.ai_reminder?.goal_name || reminder?.context?.goal_name || '';
                              const goalAmount = reminder?.goal_amount || reminder?.ai_reminder?.goal_amount || reminder?.context?.goal_amount || 0;
                              navigate(`/payment/${goalId}`, {
                                state: {
                                  goalName,
                                  goalAmount,
                                  reminderId: reminder.id || reminder._id
                                }
                              });
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })()}
              {/* Today Section */}
              {today.length > 0 && (
                <section className="mb-8" aria-label="Today">
                  <h2 className="text-lg font-bold text-white mb-4">Today</h2>
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    {today.map(notification => (
                      <li key={notification.id || notification._id}>
                        <WelcomeNotificationCard
                          title={notification.title}
                          message={notification.message}
                          timestamp={notification.timestamp}
                          textColor="white"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {/* Yesterday Section */}
              {yesterday.length > 0 && (
                <section className="mb-8" aria-label="Yesterday">
                  <h2 className="text-lg font-bold text-white mb-4">Yesterday</h2>
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    {yesterday.map(notification => (
                      <li key={notification.id || notification._id}>
                        <WelcomeNotificationCard
                          title={notification.title}
                          message={notification.message}
                          timestamp={notification.timestamp}
                          textColor="white"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {/* Old Notifications Section */}
              {(old.length > 0 || oldNotifications.length > 0) && (
                <section className="mb-8" aria-label="Old Notifications">
                  <h2 className="text-lg font-bold text-secondary mb-4">Old Notifications</h2>
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    {[...old, ...oldNotifications].map(notification => (
                      <li key={notification.id || notification._id}>
                        <WelcomeNotificationCard
                          title={notification.title}
                          message={notification.message}
                          timestamp={notification.timestamp}
                          textColor="white"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {/* Empty State */}
              {today.length === 0 && yesterday.length === 0 && old.length === 0 && oldNotifications.length === 0 && (
                <section className="text-center py-12 sm:py-16" aria-labelledby="empty-state-title">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                    <Notifications className="w-8 h-8 sm:w-10 sm:h-10 text-secondary/60" />
                  </div>
                  <h3 id="empty-state-title" className="text-lg sm:text-xl font-semibold text-secondary/80 mb-2">All caught up!</h3>
                  <p className="text-sm sm:text-base text-secondary/60">No new notifications at the moment.</p>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </MobileLayout>
  );
}
