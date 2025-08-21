import { useState, useEffect } from "react";
import { allocateQuotas } from "../../lib/api";
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
import { useMembersContext } from "./contexts/MembersContext.jsx";

const SplitBill = ({ open, onClose, planId, onSave }) => {
  const { members: groupMembers, loading: membersLoading } = useMembersContext();
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputQuota, setInputQuota] = useState("");
  const [equalSplit, setEqualSplit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync members state with groupMembers from context
  useEffect(() => {
    if (groupMembers && groupMembers.length > 0) {
      setMembers(groupMembers.map(m => ({
        id: m.id,
        name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
        quota: m.quota || 0
      })));
    }
  }, [groupMembers]);

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

  const handleFinalSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call backend to allocate quotas
      await allocateQuotas({ plan_id: planId, members });
      if (onSave) onSave(members);
      onClose();
    } catch (err) {
      setError("Failed to allocate quotas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="bg-primary text-secondary text-sm font-semibold">Allocate Monthly Quotas</DialogTitle>
      <DialogContent dividers>
        {error && (
          <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
        )}
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
          disabled={loading}
        >
          {loading ? "Saving..." : "Save All"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitBill;
