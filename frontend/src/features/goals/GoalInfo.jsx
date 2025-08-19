import { useState, useEffect } from "react";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import { Card, CardContent, IconButton, Menu, MenuItem } from "@mui/material";
import { useMembersContext } from "../../features/manager/contexts/MembersContext.jsx";
import { listGoals } from "../../lib/api";

const GoalInfo = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useMembersContext();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoading(true);
        const goalsData = await listGoals(groupId);
        setGoals(goalsData || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchGoals();
  }, [groupId]);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(null);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedGoalIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGoalIndex(null);
  };

  // Actions
  const handleEdit = () => {
    alert(`Edit goal: ${goals[selectedGoalIndex].title}`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      const goalToDelete = goals[selectedGoalIndex];
      const { deleteGoal } = await import("../../lib/api");
      await deleteGoal(goalToDelete.goal_id);
      setGoals((prev) => prev.filter((_, i) => i !== selectedGoalIndex));
    } catch (error) {
      alert("Failed to delete goal: " + error.message);
    } finally {
      handleMenuClose();
    }
  };

  const handleMarkDone = () => {
    setGoals((prev) => prev.filter((_, i) => i !== selectedGoalIndex));
    handleMenuClose();
  };

  // Helpers
  const getDaysLeft = (targetDate) => {
    if (!targetDate) return "No deadline";
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Today";
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months left`;
    return `${Math.floor(diffDays / 365)} years left`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      {loading && (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading goals...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center h-32">
          <p className="text-red-500">Error: {error}</p>
        </div>
      )}

      {!loading && !error && goals.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">No goals found</p>
        </div>
      )}

      {!loading && !error && goals.length > 0 && (
        <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-8 min-[100px] w-364 px-14 mx-4">
          {goals.map((goal, index) => (
            <Card
              key={goal.goal_id || index}
              className="rounded-2xl shadow-md cursor-pointer"
            >
              <CardContent className="flex flex-col relative">
                {/* Header */}
                <header className="flex justify-between items-start">
                  <h1 className="font-semibold text-md text-primary">
                    {goal.title}
                  </h1>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, index)}
                  >
                    <MoreIcon />
                  </IconButton>
                </header>

                {/* Days Left */}
                <p className="text-xs text-textcolor">{getDaysLeft(goal.target_date)}</p>

                {/* Amount Progress */}
                <p className="text-md text-green">
                  ₱{(goal.current_amount || 0).toLocaleString()} / ₱
                  {goal.goal_amount.toLocaleString()}
                </p>

                {/* Details */}
                <span className="text-xs text-tex">
                  <p>
                    Required Share:{" "}
                    <span className="text-green">
                      ₱{(goal.goal_amount - (goal.current_amount || 0)).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    You've Paid:{" "}
                    <span className="text-green">
                      ₱{(goal.current_amount || 0).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Remaining:{" "}
                    <span>
                      ₱{(goal.goal_amount - (goal.current_amount || 0)).toLocaleString()}
                    </span>
                  </p>
                </span>

                <br />

                {/* Deadline */}
                <p className="text-sm font-medium">
                  Deadline: {formatDate(goal.target_date)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem onClick={handleMarkDone}>Mark as Done</MenuItem>
      </Menu>
    </div>
  );
};

export default GoalInfo;
