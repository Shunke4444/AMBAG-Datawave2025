import { useState } from "react";
import { MoreVert as MoreIcon } from "@mui/icons-material";
import { Card, CardContent, IconButton, Menu, MenuItem } from "@mui/material";

const GoalInfo = () => {
  const [goals, setGoals] = useState([
    {
      title: "Monthly House Bills",
      amount: 8100.0,
      total: 15000.0,
      daysLeft: "15 days left",
      reqShare: 2500.0,
      payAmount: 2500.0,
      remaining: "None",
      deadline: "July 30, 2025",
    },
    {
      title: "Boracay Trip",
      amount: 28800.0,
      total: 90000.0,
      daysLeft: "5 months left",
      reqShare: 11500.0,
      payAmount: 5500.0,
      remaining: 6000.0,
      deadline: "December 19, 2025",
    },
    {
      title: "Tuition Fee",
      amount: 39000.0,
      total: 50000.0,
      daysLeft: "35 days left",
      reqShare: 8600.0,
      payAmount: 4000.0,
      remaining: 4600.0,
      deadline: "August 15, 2025",
    },
    {
      title: "Emergency Funds",
      amount: 56100.0,
      total: 330000.0,
      daysLeft: "1 year left",
      reqShare: 5500.0,
      payAmount: 5500.0,
      remaining: "None",
      deadline: "July 30, 2026",
    },
  ]);

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

  const handleDelete = () => {
    setGoals((prev) => prev.filter((_, i) => i !== selectedGoalIndex));
    handleMenuClose();
  };

  const handleMarkDone = () => {
    setGoals((prev) => prev.filter((_, i) => i !== selectedGoalIndex));
    handleMenuClose();
  };

  return (
    <div>
      <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-8 min-[100px] w-364 px-14 mx-4">
        {goals.map((goal, index) => (
          <Card key={index} className="rounded-2xl shadow-md cursor-pointer">
            <CardContent className="flex flex-col relative">
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
              <p className="text-xs text-textcolor">{goal.daysLeft}</p>
              <p className="text-md text-green">
                {goal.amount} / {goal.total}
              </p>
              <span className="text-xs text-tex">
                <p>
                  Required Share:{" "}
                  <span className="text-green">{goal.reqShare}</span>
                </p>
                <p>
                  You've Paid:{" "}
                  <span className="text-green">{goal.payAmount}</span>
                </p>
                <p>
                  Remaining: <span>{goal.remaining}</span>
                </p>
              </span>
              <br />
              <p className="text-sm font-medium">
                Deadline: {goal.deadline}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
