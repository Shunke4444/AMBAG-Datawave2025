import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAgenticNotifications } from '../../lib/api';
import {
  CheckCircle,
  Warning,
  TrendingUp,
  AccountBalance,
  Group,
  Close,
  Schedule,
  Flag,
  Notifications
} from '@mui/icons-material';
import MobileLayout from '../payments/PaymentLayout';

export default function MemberNotification({ goalId }) {
  const navigate = useNavigate();
  const [actionNotifications, setActionNotifications] = useState({
    loan_suggestion: null
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demo: fallback goalId if not provided
  const effectiveGoalId = goalId || 'demo-goal-id';

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAgenticNotifications(effectiveGoalId);
        // Flatten notifications for UI (customize as needed)
        setNotifications(res.notifications || []);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [effectiveGoalId]);

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
      return result;
    } else {
      console.error('Unknown action:', actionName);
      return { success: false, error: 'Unknown action' };
    }
  };

  // Render
  return (
    <MobileLayout title="Notifications">
      <section className="pt-6 pb-6" aria-label="Notifications">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-8">Loading notifications...</div>
          ) : error ? (
            <div className="text-center py-8 text-red">{error}</div>
          ) : notifications.length === 0 ? (
            <section className="text-center py-12 sm:py-16" aria-labelledby="empty-state-title">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                <Notifications className="w-8 h-8 sm:w-10 sm:h-10 text-secondary/60" />
              </div>
              <h3 id="empty-state-title" className="text-lg sm:text-xl font-semibold text-secondary/80 mb-2">All caught up!</h3>
              <p className="text-sm sm:text-base text-secondary/60">No new notifications at the moment.</p>
            </section>
          ) : (
            <ul className="space-y-3 sm:space-y-4" role="list">
              {notifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                return (
                  <li key={notification.id || notification._id}>
                    <article className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${config.style}`}
                      aria-labelledby={`notification-title-${notification.id}`}
                      aria-describedby={`notification-content-${notification.id} notification-time-${notification.id}`}
                      data-notification-type={notification.type}
                      data-priority={config.priority}
                      data-ai-accessible={config.aiAccessible}
                    >
                      {/* New Badge */}
                      {notification.isNew && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full border-2 border-secondary" aria-label="New notification"></div>
                      )}
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 id={`notification-title-${notification.id}`} className="font-semibold text-sm sm:text-base text-textcolor mb-1">
                            {notification.title || notification.message?.slice(0, 30) || 'Notification'}
                          </h3>
                          <p id={`notification-content-${notification.id}`} className="text-xs sm:text-sm text-textcolor/80 leading-relaxed mb-2">
                            {notification.message}
                          </p>
                          <time id={`notification-time-${notification.id}`} className="text-xs text-textcolor/60" dateTime={notification.timestamp || ''}>{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : ''}</time>

                        {/* Action Buttons for Loan Suggestion */}
                        {notification.hasActions && notification.actionId === 'loan_suggestion' && (
                          <div className="mt-4 pt-4 border-t border-textcolor/10" role="group" aria-labelledby={`actions-label-${notification.id}`}>
                            {actionNotifications[notification.actionId] ? (
                              <div className="flex items-center gap-2 text-sm text-green" role="status" aria-live="polite">
                                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                <span>
                                  {actionNotifications[notification.actionId] === 'member' && 'Request sent to group members'}
                                  {actionNotifications[notification.actionId] === 'bpi' && 'BPI loan application initiated'}
                                  {actionNotifications[notification.actionId] === 'reject' && 'Suggestion dismissed'}
                                </span>
                              </div>
                            ) : (
                              <>
                                <p id={`actions-label-${notification.id}`} className="text-xs text-textcolor/70 mb-3">Choose an option:</p>
                                <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`actions-label-${notification.id}`}>
                                  <button
                                    onClick={() => handleNotificationAction('requestLoanFromMembers', notification.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-primary text-secondary text-xs sm:text-sm font-medium rounded-lg hover:bg-shadow transition-colors"
                                    aria-describedby={`notification-content-${notification.id}`}
                                    data-action="requestLoanFromMembers"
                                    data-notification-id={notification.id}
                                  >
                                    <Group className="w-4 h-4" aria-hidden="true" />
                                    Ask Members
                                  </button>
                                  <button
                                    onClick={() => handleNotificationAction('requestBPILoan', notification.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-accent text-primary text-xs sm:text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
                                    aria-describedby={`notification-content-${notification.id}`}
                                    data-action="requestBPILoan"
                                    data-notification-id={notification.id}
                                  >
                                    <AccountBalance className="w-4 h-4" aria-hidden="true" />
                                    BPI Loan
                                  </button>
                                  <button
                                    onClick={() => handleNotificationAction('dismissSuggestion', notification.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-textcolor/10 text-textcolor text-xs sm:text-sm font-medium rounded-lg hover:bg-textcolor/20 transition-colors"
                                    aria-describedby={`notification-content-${notification.id}`}
                                    data-action="dismissSuggestion"
                                    data-notification-id={notification.id}
                                  >
                                    <Close className="w-4 h-4" aria-hidden="true" />
                                    Not Now
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Generic Action Buttons for other notification types */}
                        {!notification.hasActions && config.aiAccessible && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleNotificationAction('markAsRead', notification.id)}
                              className="text-xs text-textcolor/60 hover:text-textcolor transition-colors"
                              data-action="markAsRead"
                              data-notification-id={notification.id}
                            >
                              Mark as read
                            </button>
                            {config.actions.includes('snoozeNotification') && (
                              <button
                                onClick={() => handleNotificationAction('snoozeNotification', notification.id, '1hour')}
                                className="text-xs text-textcolor/60 hover:text-textcolor transition-colors"
                                data-action="snoozeNotification"
                                data-notification-id={notification.id}
                              >
                                Snooze
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                  </li>
                  );
                })}
              </ul>
          )}
        </div>
      </section>
    </MobileLayout>
  );
}
