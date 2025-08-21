import React from "react";

export default function AgenticReminderCard({ reminder }) {
  if (!reminder) return null;
  const message = reminder?.ai_reminder?.message || reminder?.message || "No message";
  const urgency = reminder?.ai_reminder?.urgency_level || reminder?.context?.urgency || reminder?.urgency || "N/A";
  const due = reminder?.context?.deadline || reminder?.deadline || "";
  const timestamp = reminder?.timestamp || reminder?.created_at || "";
  const actions = reminder?.ai_reminder?.suggested_actions || reminder?.suggested_actions || [];

  return (
    <article className="relative p-4 sm:p-5 rounded-xl border-2 border-accent/40 bg-accent/10 hover:shadow-lg transition-all duration-300">
      <h3 className="font-semibold text-base text-accent mb-2">
        {reminder.reminder_type ? reminder.reminder_type.replace("_", " ") : "Agentic Reminder"}
      </h3>
      <p className="text-sm text-accent/90 mb-2">{message}</p>
      <div className="text-xs text-accent/70 mb-2">Urgency: {urgency}</div>
      <div className="text-xs text-accent/70 mb-2">Due: {due}</div>
      <time className="text-xs text-accent/60" dateTime={timestamp}>
        {timestamp ? new Date(timestamp).toLocaleString() : ""}
      </time>
      {Array.isArray(actions) && actions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {actions.map((action, idx) => (
            <li key={idx} className="text-xs text-primary/80">• {action}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
