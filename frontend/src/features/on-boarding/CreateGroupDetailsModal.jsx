import React, { useState } from "react";
import { Box, Modal, Typography,  TextField, Button } from "@mui/material";

export default function CreateGroupDetailsModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const COLORS = {
    background: "#830000",
    accent: "#FFD700",
    text: "#fff",
    buttonBg: "#FFD700",
    buttonText: "#2D0A0A",
    border: "#FFD700",
  };

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit({ name, description });
      setName("");
      setDescription("");
      onClose();
    }
  };

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
          Create Group Details
        </Typography>
        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: COLORS.text }}>
          GROUP NAME <span style={{ color: COLORS.accent }}>*</span>
        </Typography>
        <TextField
          autoFocus
          margin="none"
          type="text"
          fullWidth
          required
          value={name}
          onChange={e => setName(e.target.value)}
          sx={{ mb: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1, '& .MuiInputBase-input': { color: COLORS.buttonText } }}
        />
        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: COLORS.text }}>
          DESCRIPTION <span style={{ color: COLORS.accent }}>(optional)</span>
        </Typography>
        <TextField
          margin="none"
          type="text"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          sx={{ mb: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1, '& .MuiInputBase-input': { color: COLORS.buttonText } }}
        />
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button onClick={onClose} sx={{ color: COLORS.text, borderColor: COLORS.accent }} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            sx={{ bgcolor: COLORS.buttonBg, color: COLORS.buttonText, fontWeight: "bold", borderRadius: 2, '&:hover': { bgcolor: COLORS.accent } }}
            variant="contained"
            disabled={!name.trim()}
          >
            Create Group
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

