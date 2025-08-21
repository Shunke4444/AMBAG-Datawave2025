import React from "react";

export default function AgenticReminderCard({ reminder, onPayShare, onSnooze }) {
  if (!reminder) return null;
  const message = reminder?.ai_reminder?.message || reminder?.message || "No message";
  const urgency = reminder?.ai_reminder?.urgency_level || reminder?.context?.urgency || reminder?.urgency || "N/A";
  const due = reminder?.context?.deadline || reminder?.deadline || "";
  const timestamp = reminder?.timestamp || reminder?.created_at || "";
  const goalId = reminder?.goal_id;

  // Handler for Pay Share button
  const handlePayShare = () => {
    if (onPayShare) {
      onPayShare(goalId);
    } else {
      // Default: redirect to payment page for this goal
        window.location.href = `/payment/${goalId}`;
    }
  };

  // Handler for Snooze button
  const handleSnooze = () => {
    if (onSnooze) {
      onSnooze(reminder.id || reminder._id);
    } else {
      alert('Reminder snoozed!');
    }
  };

  return (
    <article className="relative p-4 sm:p-5 rounded-xl border-2 border-accent/40 bg-accent hover:shadow-lg transition-all duration-300">
      <h3 className="font-semibold text-base text-black mb-2">
        {reminder.reminder_type ? reminder.reminder_type.replace("_", " ") : "Agentic Reminder"}
      </h3>
      <p className="text-sm text-black mb-2">{message}</p>
      <div className="text-xs text-black">Urgency: {urgency}</div>
      <div className="text-xs text-black">Due: {due}</div>
      <time className="text-xs text-black" dateTime={timestamp}>
        {timestamp ? new Date(timestamp).toLocaleString() : ""}
      </time>
      <div className="mt-4 flex gap-2">
        <button
          className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/80 transition-colors"
          onClick={handlePayShare}
        >
          Pay Share
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition-colors"
          onClick={handleSnooze}
        >
          Snooze
        </button>
      </div>
    </article>
  );
}
