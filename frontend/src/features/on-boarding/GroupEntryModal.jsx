import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../../lib/api";
import { getAuth } from "firebase/auth";
import CreateGroupTypeModal from "./CreateGroupTypeModal";
import CreateGroupDetailsModal from "./CreateGroupDetailsModal";
import { Button, Modal, Box, Typography } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import TermsAndConditions from "./TermsCheckbox";

const COLORS = {
  background: "#830000",
  accent: "#FFD700", 
  text: "#fff",
  buttonBg: "#FFD700",
  buttonText: "#2D0A0A",
  border: "#FFD700",
};

export default function GroupEntryModal({ open, onClose, onCreate, onJoin }) {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const navigate = useNavigate();
  return (
    <>
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
            onClick={() => setShowTypeModal(true)}
            sx={{
              bgcolor: COLORS.buttonBg,
              color: COLORS.buttonText,
              fontWeight: "bold",
              mb: 2,
              borderRadius: 2,
              '&:hover': { bgcolor: COLORS.accent },
            }}
            disabled={!termsAccepted}
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
              
            disabled={!termsAccepted}
          >
            Join a Group
          </Button>
                 <TermsAndConditions termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} />
        </Box>
      </Modal>
      <CreateGroupTypeModal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        onSelectType={(type) => {
          setShowTypeModal(false);
          setShowDetailsModal(true);
        }}
      />
      <CreateGroupDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSubmit={async (details) => {
          setShowDetailsModal(false);
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) {
            alert("You must be logged in to create a group.");
            return;
          }
          try {
            const group = await createGroup({
              name: details.name,
              description: details.description,
              manager_id: user.uid,
            });
            setCreatedGroup(group);
          } catch (err) {
            alert("Error creating group: " + err.message);
          }
        }}
      />
      {createdGroup && (
        <Modal open={true} onClose={() => { setCreatedGroup(null); onClose(); }}>
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
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Group Created!
            </Typography>
            <Typography variant="body1" mb={2}>
              <b>Group Code:</b><br />
              <span style={{ wordBreak: 'break-all', color: COLORS.accent, fontSize: '1.5rem', letterSpacing: 2 }}>
                {createdGroup.group_id}
              </span>
            </Typography>
            <Typography variant="body2" mb={3}>
              Share this link with your friends so they can join your group.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ bgcolor: COLORS.buttonBg, color: COLORS.buttonText, fontWeight: "bold", borderRadius: 2, mb: 2, '&:hover': { bgcolor: COLORS.accent } }}
              onClick={() => {
                setCreatedGroup(null);
                navigate("/dashboard");
              }}
            >
              Start your Ambag journey!
            </Button>
          </Box>
        </Modal>
      )}
    </>
  );
}
