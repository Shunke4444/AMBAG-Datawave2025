import React from "react";
import { useState } from "react";
import LoanRequestModal from "../loan/LoanRequestModal";

export default function AgenticReminderCard({ reminder, onPayShare, onSnooze }) {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const handleLoan = () => setShowLoanModal(true);


  const [showAutoPayModal, setShowAutoPayModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
          {/* Auto Pay Confirmation Modal */}
          {showAutoPayModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-lg p-6 shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4 text-primary">Auto Pay Confirmation</h2>
                <p className="mb-6 text-black">Are you sure that you want AMBAG AI to automatically pay your expenses?</p>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded-lg bg-gray-300 text-black font-semibold" onClick={() => setShowAutoPayModal(false)}>No</button>
                  <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold" onClick={() => { setShowAutoPayModal(false); setShowSuccessModal(true); }}>Yes</button>
                </div>
              </div>
            </div>
          )}
          {/* Payment Successful Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
              <div className="bg-white rounded-lg p-6 shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4 text-primary">Payment Successful!</h2>
                <p className="mb-6 text-black">AMBAG AI has paid your expenses automatically.</p>
                <div className="flex justify-end">
                  <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold" onClick={() => setShowSuccessModal(false)}>Close</button>
                </div>
              </div>
            </div>
          )}
                    {/* LoanRequestModal for Loan button */}
                    <LoanRequestModal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} />
      <h3 className="font-semibold text-base text-black mb-2">
        {reminder.reminder_type ? reminder.reminder_type.replace("_", " ") : "Agentic Reminder"}
      </h3>
      <p className="text-sm text-black mb-2">{message}</p>
      <div className="text-xs text-black">Urgency: {urgency}</div>
      <time className="text-xs text-black" dateTime={timestamp}>
        {timestamp ? new Date(timestamp).toLocaleString() : ""}
      </time>
      <div className="mt-4 flex gap-2">
            {(reminder.type === "goal completed" || reminder.reminder_type === "goal_completed") ? (
              <>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors" onClick={() => setShowAutoPayModal(true)}>Auto Pay</button>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors">Manual Pay</button>
              </>
            ) : (reminder.type === "deadline approaching" || reminder.reminder_type === "deadline_approaching") ? (
              <>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors" onClick={handlePayShare}>Pay Share</button>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors" onClick={handleLoan}>Loan</button>
                <button className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-700 transition-colors" onClick={handleSnooze}>Snooze</button>
              </>
            ) : null}
      </div>
    </article>
  );
}
