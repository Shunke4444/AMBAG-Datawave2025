import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';

const RequestSubmittedModal = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          padding: 2,
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500'
          }}
        >
          <Close />
        </IconButton>

        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: '#4CAF50',
              mb: 2
            }}
          />
        </Box>

        {/* Success Message */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#4CAF50',
            mb: 2
          }}
        >
          Request Sent Successfully!
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 4,
            fontSize: '1.1rem'
          }}
        >
          Sent request to manager!
        </Typography>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#4CAF50',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 'semibold',
            '&:hover': {
              backgroundColor: '#45a049',
            }
          }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default RequestSubmittedModal;
