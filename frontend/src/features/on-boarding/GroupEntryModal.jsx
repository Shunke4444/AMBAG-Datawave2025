import React from "react";
import { Button, Modal, Box, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";

// Color scheme (replace with your Tailwind or theme classes if needed)
const COLORS = {
  background: "#2D0A0A", // primary dark
  accent: "#FFD700", // accent yellow
  text: "#fff",
  buttonBg: "#FFD700",
  buttonText: "#2D0A0A",
  border: "#FFD700",
};

export default function GroupEntryModal({ open, onClose, onCreate, onJoin }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 350,
          bgcolor: COLORS.background,
          color: COLORS.text,
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2} align="center">
          Create Your Group
        </Typography>
        <Typography variant="body2" mb={3} align="center">
          Your group is where you and your friends save and reach goals together. Make yours and start collaborating!
        </Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<GroupIcon />}
          onClick={onCreate}
          sx={{
            bgcolor: COLORS.buttonBg,
            color: COLORS.buttonText,
            fontWeight: "bold",
            mb: 2,
            borderRadius: 2,
            '&:hover': { bgcolor: COLORS.accent },
          }}
        >
          Create My Own
        </Button>
        <Box mt={4} mb={2}>
          <Typography variant="subtitle2" align="center" color={COLORS.text}>
            Have an invite already?
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={onJoin}
          sx={{
            color: COLORS.accent,
            borderColor: COLORS.border,
            fontWeight: "bold",
            borderRadius: 2,
            '&:hover': { bgcolor: '#FFF8E1', borderColor: COLORS.accent },
          }}
        >
          Join a Group
        </Button>
      </Box>
    </Modal>
  );
}
