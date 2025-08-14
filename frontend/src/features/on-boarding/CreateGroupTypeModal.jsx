import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import Diversity1Icon from '@mui/icons-material/Diversity1';

const COLORS = {
  background: "#830000",
  accent: "#FFD700",
  text: "#fff",
  buttonBg: "#FFD700",
  buttonText: "#000",
  border: "#FFD700",
};

export default function CreateGroupTypeModal({ open, onClose, onSelectType }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: COLORS.background,
          color: COLORS.text,
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2} align="center">
          Tell Us More About Your Group
        </Typography>
        <Typography variant="body2" mb={3} align="center">
          Is your new group for you and your community or family?
        </Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PeopleIcon />}
          onClick={() => onSelectType("friends")}
          sx={{
            bgcolor: COLORS.buttonBg,
            color: COLORS.buttonText,
            fontWeight: "bold",
            mb: 2,
            borderRadius: 2,
            '&:hover': { bgcolor: COLORS.accent },
          }}
        >
          For me and my community
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PublicIcon />}
          onClick={() => onSelectType("community")}
          sx={{
            bgcolor: COLORS.buttonBg,
            color: COLORS.buttonText,
            fontWeight: "bold",
            mb: 2,
            borderRadius: 2,
            '&:hover': { bgcolor: COLORS.accent },
          }}
        >
          For me and my family
        </Button>
        <Box mt={2} mb={2}>
          <Typography variant="body2" align="center" color={COLORS.text}>
            Not sure? You can <span style={{ color: COLORS.accent, textDecoration: 'underline', cursor: 'pointer' }} onClick={onClose}>skip this question</span> for now.
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="text"
          onClick={onClose}
          sx={{ color: COLORS.text, fontWeight: "bold" }}
        >
          Back
        </Button>
      </Box>
    </Modal>
  );
}
