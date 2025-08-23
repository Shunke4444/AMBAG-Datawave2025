import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const GoalPaidModal = ({ open = false, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "bg-[var(--color-secondary)] rounded-2xl shadow-xl w-full max-w-md mx-4",
      }}
      aria-labelledby="goal-paid-dialog-title"
    >
      <DialogTitle
        id="goal-paid-dialog-title"
        className="text-xl font-bold text-[var(--color-primary)] text-center"
      >
        🎉 Goal Paid!
      </DialogTitle>

      <DialogContent className="text-sm text-[var(--color-textcolor)] text-center px-6 py-4">
        Your goal has been successfully marked as paid! Celebrate your financial success and keep the momentum going!
      </DialogContent>

      <DialogActions className="flex justify-center pb-6">
        <button
          type="button"
          onClick={onClose}
          className="bg-[var(--color-primary)] text-[var(--color-secondary)] font-semibold px-6 py-2 rounded-xl shadow-md hover:bg-[var(--color-shadow)] transition"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalPaidModal;
