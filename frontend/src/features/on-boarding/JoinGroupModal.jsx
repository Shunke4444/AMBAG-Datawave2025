import React, { useState } from "react";
import { Box, Modal, Typography, TextField, Button } from "@mui/material";
import { joinGroup } from "../../lib/api";
import { getAuth } from "firebase/auth";

export default function JoinGroupModal({ open, onClose, onSuccess }) {
  const [groupCode, setGroupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const COLORS = {
    background: "#830000",
    accent: "#FFD700",
    text: "#fff",
    buttonBg: "#FFD700",
    buttonText: "#2D0A0A",
    border: "#FFD700",
  };

  const handleJoin = async () => {
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to join a group.");
      await joinGroup({ group_code: groupCode, firebase_uid: user.uid });
      setLoading(false);
      if (onSuccess) onSuccess(groupCode);
      setGroupCode("");
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.detail || err.message || "Failed to join group");
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
          Join a Group
        </Typography>
        <Typography variant="subtitle2" fontWeight="bold" mb={1} sx={{ color: COLORS.text }}>
          GROUP CODE <span style={{ color: COLORS.accent }}>*</span>
        </Typography>
        <TextField
          autoFocus
          margin="none"
          type="text"
          fullWidth
          required
          value={groupCode}
          onChange={e => setGroupCode(e.target.value)}
          sx={{ mb: 3, bgcolor: "#fff", borderRadius: 2, boxShadow: 1, '& .MuiInputBase-input': { color: COLORS.buttonText } }}
        />
        {error && <div style={{ color: COLORS.accent, marginBottom: 8 }}>{error}</div>}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button onClick={onClose} sx={{ color: COLORS.text, borderColor: COLORS.accent }} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            sx={{ bgcolor: COLORS.buttonBg, color: COLORS.buttonText, fontWeight: "bold", borderRadius: 2, '&:hover': { bgcolor: COLORS.accent } }}
            variant="contained"
            disabled={loading || !groupCode.trim()}
          >
            Join Group
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
