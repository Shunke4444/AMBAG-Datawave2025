import React from 'react';
import AgenticPrompt from './AgenticPrompt';

// Use a consistent light cream background for all notifications
const cardStyle = 'bg-[#fff8f0] border-none rounded-2xl shadow-md';

const MemberNotificationItem = ({ notification }) => {
	const { title, message, time, type, daysLeft, hasActions, actionId, isNew, actionNotifications, handleNotificationAction, aiAccessible, actions } = notification;
	return (
		<article className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-lg bg-[#fff8f0]`}>
			<div className="flex items-start gap-3 sm:gap-4">
				<div className="flex-1 min-w-0">
					{title && <h3 className="font-semibold text-sm sm:text-base text-textcolor mb-1">{title}</h3>}
					<p className="text-xs sm:text-sm text-textcolor/80 leading-relaxed mb-2">{message}</p>
					{time && <time className="text-xs text-textcolor/60" dateTime={time}>{time}</time>}

					{/* Action Buttons for Loan Suggestion */}
					{hasActions && actionId === 'loan_suggestion' && actionNotifications && handleNotificationAction && (
						<div className="mt-4 pt-4 border-t border-textcolor/10" role="group">
							{actionNotifications[actionId] ? (
								<div className="flex items-center gap-2 text-sm text-green" role="status" aria-live="polite">
									<span>
										{actionNotifications[actionId] === 'member' && 'Request sent to group members'}
										{actionNotifications[actionId] === 'bpi' && 'BPI loan application initiated'}
										{actionNotifications[actionId] === 'reject' && 'Suggestion dismissed'}
									</span>
								</div>
							) : (
								<>
									<p className="text-xs text-textcolor/70 mb-3">Choose an option:</p>
									<div className="flex flex-wrap gap-2" role="group">
										<button
											onClick={() => handleNotificationAction('requestLoanFromMembers', notification.id)}
											className="flex items-center gap-2 px-3 py-2 bg-primary text-secondary text-xs sm:text-sm font-medium rounded-lg hover:bg-shadow transition-colors"
										>
											Ask Members
										</button>
										<button
											onClick={() => handleNotificationAction('requestBPILoan', notification.id)}
											className="flex items-center gap-2 px-3 py-2 bg-accent text-primary text-xs sm:text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
										>
											BPI Loan
										</button>
										<button
											onClick={() => handleNotificationAction('dismissSuggestion', notification.id)}
											className="flex items-center gap-2 px-3 py-2 bg-textcolor/10 text-textcolor text-xs sm:text-sm font-medium rounded-lg hover:bg-textcolor/20 transition-colors"
										>
											Not Now
										</button>
									</div>
								</>
							)}
						</div>
					)}

					{/* Generic Action Buttons for other notification types */}
					{!hasActions && aiAccessible && actions && handleNotificationAction && (
						<div className="mt-3 flex gap-2">
							<button
								onClick={() => handleNotificationAction('markAsRead', notification.id)}
								className="text-xs text-textcolor/60 hover:text-textcolor transition-colors"
							>
								Mark as read
							</button>
							{actions.includes('snoozeNotification') && (
								<button
									onClick={() => handleNotificationAction('snoozeNotification', notification.id, '1hour')}
									className="text-xs text-textcolor/60 hover:text-textcolor transition-colors"
								>
									Snooze
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</article>
	);
};

export default MemberNotificationItem;
