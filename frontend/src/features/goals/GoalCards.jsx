import { Card, CardContent, LinearProgress, Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';

const formatMoney = (n) => {
  const safe = Number(n) || 0;
  return "₱" + safe.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ".00";
};

// Custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

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

  const percent = Math.min(Math.max((goal.amount / goal.total) * 100, 0), 100);
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
          {calculateDaysLeft(goal.targetDate)}
        </p>
      </CardContent>
    </Card>
  );
};

const GoalCards = ({ goals = [] }) => {
  console.log('GoalCards received goals:', goals);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const mappedGoals = goals.map((g) => ({
    id: g.goal_id || g.id || g.title,
    title: g.title,
    amount: g.current_amount ?? g.amount ?? 0,
    total: g.goal_amount ?? g.total ?? 0,
    targetDate: g.target_date ?? g.targetDate ?? null,
  }));

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [goals]); // Re-run when goals change

  if (!mappedGoals.length) {
    return <div className="text-gray-500">No goals found.</div>;
  }

  return (
    <div className="w-full relative">
      <style>{scrollbarStyles}</style>
      
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ marginLeft: '12px' }}
        >
          <ChevronLeft className="text-gray-600" />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ marginRight: '12px' }}
        >
          <ChevronRight className="text-gray-600" />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory'
        }}
        onScroll={checkScrollButtons}
        onLoad={checkScrollButtons}
      >
        {mappedGoals.map((goal) => (
          <div 
            key={goal.id} 
            className="flex-shrink-0 w-80 h-64 px-8"
            style={{ scrollSnapAlign: 'start' }}
          >
            <GoalCardGlassMobile goal={goal} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalCards;
