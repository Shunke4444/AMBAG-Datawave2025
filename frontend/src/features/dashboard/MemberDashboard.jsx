import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import useIsMobile from "../../hooks/useIsMobile";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import BalanceCard from "./BalanceCard";
import { useMembersContext } from "../manager/contexts/MembersContext.jsx";
import MemberPage from '../members/MemberPage.jsx';

import { useEffect, useState } from "react";
import { listGoals } from "../../lib/api";


const MemberDashboard = ({ onLoan }) => {
  const isUseMobile = useIsMobile();
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const { members, loading: membersLoading } = useMembersContext();

  // Fetch goals
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

  const mappedGoals = goals
    .map(g => ({
      ...g,
      amount: g.current_amount ?? 0,
      total: g.goal_amount ?? 0,
      targetDate: g.target_date || g.dueDate || "",
    }))
    .slice(0, 6);

  // Flags similar to ManagerDashboard
  const hasGoals = goals.length > 0;
  const hasMembers = Array.isArray(members) && members.length > 0;

  const showGoals = !goalsLoading && hasGoals;
  const showGroup = hasMembers;

  const hasData = showGoals || showGroup;
  const isLoading = goalsLoading || membersLoading;
  const isLeftColumnLoading = membersLoading && !hasMembers;

  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        {/* Mobile view reuses GoalCarousel */}
        <MemberPage />
      </main>
    );
  }

  // Desktop Layout (mirrors manager layout, member-safe)
  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-start mt-24">
      <div className="bg-primary w-full max-w-6xl mx-auto rounded-4xl grid grid-cols-1 md:grid-cols-3 gap-4 p-4 auto-rows-min">
        {/* LEFT COLUMN */}
        {isLeftColumnLoading ? (
          <div className="bg-gray-100 rounded-2xl p-6 col-span-1 flex items-center justify-center">
            <p className="text-gray-500">Loading group...</p>
          </div>
        ) : hasData && showGroup ? (
          <div className="bg-secondary rounded-2xl p-4">
            <ContributionDiv members={members} loading={membersLoading} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-4 col-span-1 flex items-center justify-center border border-gray-200">
            <p className="text-gray-600 text-sm">No group members yet</p>
          </div>
        )}

        {/* TOP RIGHT (Balance + Goals) */}
        <div
          className={`col-span-2 ${
            hasData ? "bg-secondary" : "bg-gray-50 border border-gray-200"
          } rounded-2xl p-4 h-120 flex flex-col items-center justify-start`}
        >
          <div className="w-full ">
              <BalanceCard />
          </div>


          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading goals...</p>
            </div>
          ) : hasData && showGoals ? (
            <div className="w-full mt-4">
              <GoalCards goals={mappedGoals} />
            </div>
          ) : (
            <p className="text-gray-600 text-sm mt-6">No goals yet</p>
          )}
        </div>

        {/* BOTTOM LEFT */}
        <div className="bg-white row-span-3 rounded-2xl p-4 shadow-sm flex items-center justify-center">
          {hasData ? <ConsistencyStat /> : <p className="text-gray-400">No stats yet</p>}
        </div>

        {/* BOTTOM RIGHT */}
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
          <DashboardBtns onLoan={onLoan} />
        </div>
      </div>
    </main>
  );
};

export default MemberDashboard;
