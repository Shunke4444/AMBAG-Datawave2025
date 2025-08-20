
import { Card, CardContent, LinearProgress, Box } from '@mui/material';

const formatMoney = (n) => {
  const safe = Number(n) || 0;
  return "₱" + safe.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ".00";
};

// Helper function to calculate days left
export const calculateDaysLeft = (targetDate) => {
  if (!targetDate) return "No deadline";
  const target = new Date(targetDate);
  const today = new Date();
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "1 day left";
  if (diffDays < 30) return `${diffDays} days left`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} left`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} left`;
};

const getStatus = (amount, total) => {
  if (total <= 0) return "Unknown";
  const percentage = (amount / total) * 100;

  if (percentage === 0) return "Not Started";
  if (percentage < 75) return "In Progress";
  if (percentage < 100) return "Almost Complete";
  return "Completed";
};

const GoalCardGlassMobile = ({ goal }) => {
  if (!goal) return null;

  const percent = Math.min(
    Math.max((goal.amount / goal.total) * 100, 0),
    100
  );
  const status = getStatus(goal.amount, goal.total);

  return (
    <Card className="bg-white !rounded-2xl p-4 shadow-md space-y-2 h-64">
      <CardContent>
        {/* Title */}
        <h1 className="text-sm font-semibold mb-4">{goal.title}</h1>

        {/* Percentage + Status */}
        <div className="text-sm font-semibold text-primary">
          {Math.round(percent)}%{" "}
          <span className="font-light text-xs text-primary">
            {status}
          </span>
        </div>

        {/* Progress Bar */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box width="100%" mr={1}>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#3b82f6", // Tailwind blue-500
                }
              }}
            />
          </Box>
        </Box>

        {/* Amount */}
        <p className="text-xs font-medium mt-4">
          {formatMoney(goal.amount)} / {formatMoney(goal.total)}
        </p>

        {/* Days Left */}
        <p className="text-xxs text-gray-500 mt-4">
          {calculateDaysLeft(goal.targetDate || goal.daysLeft)}
        </p>
      </CardContent>
    </Card>
  );
};


// New: GoalCards component to render a list of goal cards
const GoalCards = ({ goals = [] }) => {
  console.log('GoalCards received goals:', goals);
  if (!goals.length) return <div className="text-gray-500">No goals found.</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((goal) => (
        <GoalCardGlassMobile key={goal.goal_id || goal.id || goal.title} goal={goal} />
      ))}
    </div>
  );
};

export default GoalCards;
