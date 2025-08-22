import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const GoalPaidModal = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Goal Paid!</DialogTitle>
      <DialogContent>
        Goal is Paid! Cheers for achieving a financial success!
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalPaidModal;