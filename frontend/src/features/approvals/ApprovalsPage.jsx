import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { listPendingGoals, approveOrRejectGoal } from '../../lib/api';
import { useAuthRole } from '../../contexts/AuthRoleContext';

// Helper function to calculate days left
const calculateDaysLeft = (targetDate) => {
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  if (diffDays < 30) return `${diffDays} days left`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} left`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} left`;
};

const ApprovalsPage = () => {
  const [pendingGoals, setPendingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, goal: null, action: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { authRole } = useAuthRole();

  useEffect(() => {
    fetchPendingGoals();
  }, []);

  const fetchPendingGoals = async () => {
    try {
      setLoading(true);
      const goals = await listPendingGoals();
      setPendingGoals(goals);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending goals:', err);
      setError('Failed to load pending goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (goal, action) => {
    setActionDialog({ open: true, goal, action });
    setRejectionReason('');
  };

  const handleActionConfirm = async () => {
    const { goal, action } = actionDialog;
    
    try {
      setSubmitting(true);
      
      await approveOrRejectGoal(
        goal.goal_id,
        action,
        'Manager', // Simplified manager name
        action === 'reject' ? rejectionReason : null
      );
      
      await fetchPendingGoals();
      
      setSnackbar({
        open: true,
        message: `Goal ${action === 'approve' ? 'approved' : 'rejected'} successfully!`,
        severity: 'success'
      });
      
      setActionDialog({ open: false, goal: null, action: null });
    } catch (err) {
      console.error(`Error ${action}ing goal:`, err);
      setSnackbar({
        open: true,
        message: `Failed to ${action} goal.`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!submitting) {
      setActionDialog({ open: false, goal: null, action: null });
      setRejectionReason('');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authRole !== 'manager') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Only managers can access the approvals page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Goal Approvals
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve or reject goals submitted by contributors.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : pendingGoals.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <PendingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No pending goals to review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All submitted goals have been processed.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {pendingGoals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.goal_id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {goal.title}
                  </Typography>

                  {goal.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {goal.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<PendingIcon />}
                      label="Pending Approval"
                      color="warning"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(goal.goal_amount)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {goal.creator_name} ({goal.creator_role})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DateIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Target: {formatDate(goal.target_date)}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {calculateDaysLeft(goal.target_date)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleActionClick(goal, 'approve')}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleActionClick(goal, 'reject')}
                      size="small"
                      sx={{ flex: 1 }}
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === 'approve' ? 'Approve Goal' : 'Reject Goal'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.goal && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to {actionDialog.action} the goal "{actionDialog.goal.title}"?
              </Typography>
              
              {actionDialog.action === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Rejection Reason (Optional)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejecting this goal..."
                  sx={{ mt: 2 }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            color={actionDialog.action === 'approve' ? 'success' : 'error'}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting 
              ? `${actionDialog.action === 'approve' ? 'Approving' : 'Rejecting'}...`
              : actionDialog.action === 'approve' ? 'Approve' : 'Reject'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApprovalsPage;
