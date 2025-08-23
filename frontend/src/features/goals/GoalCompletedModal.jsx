import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const GoalCompletedModal = ({ open = false, goal = null, onClose, onProceed }) => {
  if (!goal) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "bg-[var(--color-secondary)] rounded-2xl shadow-xl w-full max-w-md mx-4",
      }}
      aria-labelledby="goal-completed-dialog-title"
    >
      <DialogTitle
        id="goal-completed-dialog-title"
        className="text-xl font-bold text-[var(--color-accent)] text-center"
      >
        ✅ Goal Completed!
      </DialogTitle>

      <DialogContent className="text-sm text-[var(--color-textcolor)] text-center px-6 py-4">
        Do you want to withdraw the pooled savings for{" "}
        <strong>{goal?.title ?? "this goal"}</strong>?
      </DialogContent>

      <DialogActions className="flex justify-center pb-6 gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-[var(--color-secondary)] border border-[var(--color-accent)] text-[var(--color-accent)] font-semibold px-6 py-2 rounded-xl shadow-sm hover:bg-[var(--color-accent)] hover:text-[var(--color-secondary)] transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onProceed}
          className="bg-[var(--color-primary)] text-[var(--color-secondary)] font-semibold px-6 py-2 rounded-xl shadow-md hover:bg-[var(--color-shadow)] transition"
        >
          Proceed
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalCompletedModal;
