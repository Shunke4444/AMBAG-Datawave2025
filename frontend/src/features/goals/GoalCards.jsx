import { Card, CardContent, LinearProgress, Box } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { getMemberQuota } from '../../lib/api';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import GoalCompletedModal from './GoalCompletedModal';
import GoalPaidModal from './GoalPaidModal';
import { deleteGoal } from '../../lib/api';

const formatMoney = (n) => {
  const safe = Number(n) || 0;
  return "₱" + safe.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ".00";
};

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
        <h1 className="text-sm font-semibold mb-4">{goal.title}</h1>
        <div className="text-sm font-semibold text-primary">
          {Math.round(percent)}% <span className="font-light text-xs text-primary">{status}</span>
        </div>
        <Box display="flex" alignItems="center" gap={2}>
          <Box width="100%" mr={1}>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{ "& .MuiLinearProgress-bar": { backgroundColor: "#3b82f6" } }}
            />
          </Box>
        </Box>
        <p className="text-xs font-medium mt-4">
          {formatMoney(goal.amount)} / {formatMoney(goal.total)}
        </p>
        <p className="text-xs font-bold text-primary mt-2">
          Your Share: {formatMoney(goal.yourShare ?? 0)}
        </p>
        <p className="text-xxs text-gray-500 mt-4">
          {calculateDaysLeft(goal.targetDate)}
        </p>
      </CardContent>
    </Card>
  );
};

const GoalCards = ({ goals = [] }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [userShareMap, setUserShareMap] = useState({});
  const [loadingShares, setLoadingShares] = useState(true);

  const [completedGoal, setCompletedGoal] = useState(null);
  const [shownGoals, setShownGoals] = useState(new Set());
  const prevPercentsRef = useRef({});
  const [paidGoalModalOpen, setPaidGoalModalOpen] = useState(false);
  const [goalsList, setGoalsList] = useState(goals); // live state for deletion

  // Load shownGoals from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("shownGoals");
    if (stored) setShownGoals(new Set(JSON.parse(stored)));
  }, []);

  useEffect(() => {
    localStorage.setItem("shownGoals", JSON.stringify([...shownGoals]));
  }, [shownGoals]);

  // Fetch user shares
  useEffect(() => {
    let isMounted = true;
    const fetchShares = async () => {
      setLoadingShares(true);
      const user = getAuth().currentUser;
      if (!user) {
        setLoadingShares(false);
        return;
      }
      const uid = user.uid;
      const shares = {};
      for (const g of goals) {
        try {
          const res = await getMemberQuota({ goal_id: g.goal_id || g.id, user_id: uid });
          shares[g.goal_id || g.id] = res?.quota ?? 0;
        } catch {
          shares[g.goal_id || g.id] = 0;
        }
      }
      if (isMounted) {
        setUserShareMap(shares);
        setLoadingShares(false);
      }
    };
    fetchShares();
    return () => { isMounted = false; };
  }, [goals]);

  const mappedGoals = goalsList.map((g) => ({
    ...g,
    yourShare: userShareMap[g.goal_id || g.id] ?? 0,
  }));

  // Detect newly completed goals
  useEffect(() => {
    mappedGoals.forEach((g) => {
      const percent = (g.amount / g.total) * 100;
      const prevPercent = prevPercentsRef.current[g.id];

      if (prevPercent === undefined) {
        prevPercentsRef.current[g.id] = percent; // baseline
        return;
      }

      if (prevPercent < 100 && percent >= 100 && !shownGoals.has(g.id)) {
        setCompletedGoal(g);
        setShownGoals((prev) => new Set(prev).add(g.id));
      }

      prevPercentsRef.current[g.id] = percent;
    });
  }, [mappedGoals, shownGoals]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  if (loadingShares) return <div className="text-gray-500">Loading your shares...</div>;
  if (!mappedGoals.length) return <div className="text-gray-500">No goals found.</div>;

  return (
    <div className="w-full relative">
      {canScrollLeft && (
        <button
          onClick={() => scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' })}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
        >
          <ChevronLeft className="text-gray-600" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' })}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
        >
          <ChevronRight className="text-gray-600" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
        onScroll={checkScrollButtons}
      >
        {mappedGoals.map((goal) => (
          <div key={goal.id} className="flex-shrink-0 w-80 h-64 px-8" style={{ scrollSnapAlign: 'start' }}>
            <GoalCardGlassMobile goal={goal} />
          </div>
        ))}
      </div>

      {/* Goal Completed Modal */}
      <GoalCompletedModal
        open={!!completedGoal}
        goal={completedGoal}
        onClose={() => setCompletedGoal(null)}
        // Proceed triggers Paid modal
        onProceed={() => {
          setCompletedGoal(null);
          setPaidGoalModalOpen(true);
        }}
        // Cancel marks as done, does not trigger Paid modal
        onCancel={() => {
          setCompletedGoal(null);
          setShownGoals(prev => new Set(prev).add(completedGoal.id));
        }}
      />

      <GoalPaidModal
        open={paidGoalModalOpen}
        onClose={async () => {
          if (completedGoal) {
            try {
              await deleteGoal(completedGoal.id);
              // remove the goal locally after successful deletion
              setGoalsList(prev => prev.filter(g => g.id !== completedGoal.id));
            } catch (err) {
              console.error("Failed to delete goal:", err);
            }
          }
          setPaidGoalModalOpen(false);
        }}
      />
    </div>
  );
};

export default GoalCards;