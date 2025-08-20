import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
} from "@mui/material";

const mockMembers = [
  { id: 1, name: "Alice", quota: 0 },
  { id: 2, name: "Bob", quota: 0 },
  { id: 3, name: "Charlie", quota: 0 },
  { id: 4, name: "Diana", quota: 0 },
  { id: 5, name: "Ethan", quota: 0 },
];

const SplitBill = ({ open, onClose, onSave }) => {
  const [members, setMembers] = useState(mockMembers);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputQuota, setInputQuota] = useState("");
  const [equalSplit, setEqualSplit] = useState(false);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setInputQuota(member.quota.toString());
  };

  const handleSaveQuota = () => {
    if (selectedMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMember.id ? { ...m, quota: Number(inputQuota) } : m
        )
      );
      setSelectedMember(null);
      setInputQuota("");
    }
  };

  const handleEqualSplitToggle = () => {
    setEqualSplit(!equalSplit);
    if (!equalSplit) {
      const total = 100; // EXAMPLE POOL BALANCE, adjust as needed 
      const fairShare = Math.floor(total / members.length);
      setMembers(members.map((m) => ({ ...m, quota: fairShare })));
    }
  };

  const handleFinalSave = () => {
    onSave(members);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="bg-primary text-secondary text-sm font-semibold">Allocate Monthly Quotas</DialogTitle>
      <DialogContent dividers>
        {/* Equal Split Option */}
        <FormControlLabel
          control={
            <Switch checked={equalSplit} onChange={handleEqualSplitToggle} />
          }
          label="Fair Split (Equal for All)"
        />

        {/* Members List */}
        <List
          className="border rounded-md"
          sx={{ maxHeight: 200, overflowY: "auto" }} // scrollable if >3
        >
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

        {/* Quota Input for selected member */}
        {selectedMember && !equalSplit && (
          <div className="mt-4 space-y-3">
            <TextField
              label={`Quota for ${selectedMember.name}`}
              type="text"
              fullWidth
              value={inputQuota}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) setInputQuota(value);
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveQuota}
              fullWidth
            >
              Save Quota
            </Button>
          </div>
        )}
      </DialogContent>

      <DialogActions className="flex gap-4">
        <button onClick={onClose} className="text-primary bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300">
          Cancel
        </button>
        <button
          onClick={handleFinalSave}
          className="bg-primary text-secondary p-2 rounded cursor-pointer hover:bg-shadow"
        >
          Save All
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitBill;
