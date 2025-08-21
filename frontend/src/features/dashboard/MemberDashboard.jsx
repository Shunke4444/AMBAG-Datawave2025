import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import useIsMobile from "../../hooks/useIsMobile";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import MemberPage from "../../features/members/MemberPage";

import { useEffect, useState } from "react";
import { listGoals } from "../../lib/api";

const MemberDashboard = ({ onLoan }) => {
  const isUseMobile = useIsMobile();
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  // No user context needed; always fetch goals on mount

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const goalsData = await listGoals();
        console.log("MemberDashboard - Fetched goals:", goalsData);
        setGoals(goalsData || []);
      } catch (error) {
        console.error("Error fetching goals:", error);
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const mappedGoals = goals.map(g => ({
    ...g,
    amount: g.current_amount ?? 0,
    total: g.goal_amount ?? 0,
    targetDate: g.target_date || g.dueDate || "",
  })).slice(0, 6);

  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        {/* Mobile view reuses GoalCarousel */}
        <div className="p-4">
          <GoalCarouselMobile goals={mappedGoals} loading={goalsLoading} />
        </div>
      </main>
    );
  }

  // Desktop Layout
  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-center">
      <div className="bg-primary w-full max-w-6xl mx-auto rounded-4xl grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Member List - Tall Left Box */}
        <div className="bg-secondary rounded-2xl p-4 col-span-1">
          <ContributionDiv />
        </div>

        {/* Top Right Boxes */}
        <div className="col-span-2">
          <GoalCards goals={mappedGoals}  loading={goalsLoading} />
        </div>

        {/* Bottom Right Boxes */}
        <div className="col-span-1 row-span-3 bg-secondary rounded-2xl p-4">
          <ConsistencyStat />
        </div>
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
          <DashboardBtns onLoan={onLoan} />
        </div>
      </div>
    </main>
  );
};

export default MemberDashboard;
