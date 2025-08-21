import { useState, useEffect } from "react";
import { listGoals } from "../../lib/api";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useMembersContext } from "./contexts/MembersContext.jsx";

const SplitBill = ({ open, onClose, planId, onSave }) => {
  const { members: groupMembers } = useMembersContext();

  // Fetch real goals
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const data = await listGoals();
        // Normalize to { id, title }
  setGoals((data || []).map(g => ({ id: g.goal_id || g.id, title: g.title, amount: g.goal_amount || g.amount })));
      } catch (err) {
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };
    if (open) fetchGoals();
  }, [open]);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inputQuota, setInputQuota] = useState("");
  const [equalSplit, setEqualSplit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Sync members state with groupMembers from context
  useEffect(() => {
    if (groupMembers && groupMembers.length > 0) {
      setMembers(
        groupMembers.map((m) => ({
          id: m.id,
          name: m.name || `${m.first_name || ""} ${m.last_name || ""}`.trim(),
          quota: m.quota || 0,
        }))
      );
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
    if (!equalSplit && members.length === 2 && selectedGoal && selectedGoal.amount) {
      const total = Number(selectedGoal.amount);
      const fairShare = Math.floor(total / 2);
      setMembers(members.map((m, idx) => ({ ...m, quota: idx === 0 ? fairShare : total - fairShare })));
    } else if (!equalSplit && members.length > 0 && selectedGoal && selectedGoal.amount) {
      const total = Number(selectedGoal.amount);
      const fairShare = Math.floor(total / members.length);
      let remainder = total - fairShare * members.length;
      setMembers(members.map((m, idx) => ({ ...m, quota: fairShare + (idx === 0 ? remainder : 0) })));
    }
  };

  const handleFinalSave = async () => {
    if (!selectedGoal) {
      setError("Please select a goal first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Send IDs as strings (Firebase UID), quotas as numbers
      const membersPayload = members.map(m => ({
        id: m.id, // keep as string
        name: m.name,
        quota: Number(m.quota)
      }));
      // Try to get group_id from first group member (if available)
      let group_id = groupMembers && groupMembers.length > 0 && groupMembers[0].group_id ? groupMembers[0].group_id : undefined;
      // Fallback: fetch group_id from user profile if not present
      if (!group_id) {
        try {
          const user = await import("firebase/auth").then(mod => mod.getAuth().currentUser);
          if (user) {
            const res = await import("../../lib/api").then(api => api.getUserProfile(user.uid));
            group_id = res?.role?.group_id || undefined;
          }
        } catch (e) {
          // ignore
        }
      }
      const payload = {
        plan_id: planId,
        goal_id: selectedGoal.id, // backend now accepts this
        members: membersPayload,
        ...(group_id ? { group_id } : {})
      };
      console.log('ALLOCATE QUOTAS PAYLOAD:', payload);
      await allocateQuotas(payload);
      if (onSave) onSave(members, selectedGoal);
      onClose();
    } catch (err) {
      setError("Failed to allocate quotas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedGoal(null);   // 🔹 Reset chosen goal
    setMembers(groupMembers.map(m => ({
      id: m.id,
      name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
      quota: m.quota || 0
    }))); // 🔹 Reset quotas to initial
    onClose();
};


  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle className="bg-primary text-secondary text-sm font-semibold">
        Allocate Member Quotas
      </DialogTitle>
      <DialogContent dividers>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

        {/* 🔹 Goal Selection (Mock Goals) */}
        <FormControl fullWidth variant="outlined" className="mb-4">
          <InputLabel id="goal-select-label">Choose a Goal</InputLabel>
          <Select
            labelId="goal-select-label"
            value={selectedGoal ? selectedGoal.id : ""}
            onChange={(e) => {
              const goal = goals.find((g) => g.id === e.target.value);
              setSelectedGoal(goal);
            }}
            label="Choose a Goal"   // ✅ important for floating label
          >
            {goals.map((goal) => (
              <MenuItem key={goal.id} value={goal.id}>
                {goal.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 🔹 Show quota allocation ONLY if a goal is selected */}
        {selectedGoal && (
          <>
            <div className="my-3 text-lg font-semibold text-primary">Goal Amount: <span className="text-black">₱{selectedGoal.amount}</span></div>
            <FormControlLabel
              control={
                <Switch
                  checked={equalSplit}
                  onChange={handleEqualSplitToggle}
                />
              }
              label="Fair Split (Equal for All)"
            />

            <List
              className="border rounded-md"
              sx={{ maxHeight: 200, overflowY: "auto" }}
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
          </>
        )}
      </DialogContent>

      <DialogActions className="flex gap-4">
        <button
          onClick={handleClose}
          className="text-primary bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleFinalSave}
          className="bg-primary text-secondary p-2 rounded cursor-pointer hover:bg-shadow"
          disabled={loading || !selectedGoal}
        >
          {loading ? "Saving..." : "Save All"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitBill;
