import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const GoalCompletedModal = ({ open, goal, onClose, onProceed }) => {
  if (!goal) return null; 

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Goal Completed!</DialogTitle>
      <DialogContent>
        {/* Safely access goal properties */}
        Do you want to withdraw the pooled savings for <strong>{goal.title || 'this goal'}</strong>?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={onProceed} color="primary" variant="contained">
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalCompletedModal;