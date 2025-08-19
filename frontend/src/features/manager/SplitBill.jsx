import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemButton, ListItemText, Divider, Switch, FormControlLabel } from "@mui/material";

const membersData = [
  { id: 1, name: "Alice", quota: 0 },
  { id: 2, name: "Bob", quota: 0 },
  { id: 3, name: "Charlie", quota: 0 },
];

const SplitBill = () => {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(membersData);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputQuota, setInputQuota] = useState("");
  const [equalSplit, setEqualSplit] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setSelectedMember(null);
    setInputQuota("");
    setOpen(false);
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setInputQuota(member.quota);
  };

  const handleSaveQuota = () => {
    if (selectedMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, quota: Number(inputQuota) } : m
        )
      );
    }
    handleClose();
  };

  const handleEqualSplitToggle = () => {
    setEqualSplit(!equalSplit);
    if (!equalSplit) {
      const totalQuota = members.reduce((acc, m) => acc + m.quota, 0);
      const fairShare = totalQuota / members.length;
      setMembers(members.map((m) => ({ ...m, quota: fairShare })));
    }
  };

  return (
    <div className="p-4">
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Split Quota
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Split Contribution Quota</DialogTitle>
        <DialogContent className="space-y-4">
          <FormControlLabel
            control={<Switch checked={equalSplit} onChange={handleEqualSplitToggle} />}
            label="Fair Split (Equal for All)"
          />

          <List className="border rounded-md">
            {members.map((member) => (
              <div key={member.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSelectMember(member)}
                    className="flex justify-between"
                  >
                    <ListItemText primary={member.name} />
                    <span>{member.quota}</span>
                  </ListItemButton>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>

          {selectedMember && !equalSplit && (
            <div className="mt-4">
              <TextField
                label={`Set quota for ${selectedMember.name}`}
                type="number"
                fullWidth
                value={inputQuota}
                onChange={(e) => setInputQuota(e.target.value)}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveQuota} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SplitBill;
