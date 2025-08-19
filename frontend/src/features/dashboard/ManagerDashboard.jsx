import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import useIsMobile from "../../hooks/useIsMobile";
import GoalCardGlassMobile from "../goals/GoalCardGlassMobile";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import RecentActivity from "./RecentActivity";
import ActionButtons from "./ActionButtons";
import MemberHeader from "../members/MemberHeader";

import { useEffect, useState, useContext } from "react";
import { getAuth } from "firebase/auth";
import { api, listGoals } from "../../lib/api";
import { useAuthRole } from "../../contexts/AuthRoleContext";

const ManagerDashboard = ({onLoan}) => {
  const isUseMobile = useIsMobile();
  const [firstName, setFirstName] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const { user } = useAuthRole();;

  useEffect(() => {
    const fetchFirstName = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const firebase_uid = user.uid;
      const res = await api.get(`/users/profile/${firebase_uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFirstName(res?.data?.profile?.first_name || "Manager");
    };
    fetchFirstName();
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setGoalsLoading(true);
        const goalsData = await listGoals();
        console.log('ManagerDashboard - Fetched goals:', goalsData);
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
    targetDate: g.target_date,
  })).slice(0, 6);

  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        {/* Header */}
        <div className="bg-primary text-white px-4 pt-6 pb-4 rounded-b-3xl">
          <div className="mt-2">
            <MemberHeader userName={firstName || "Manager"} />
          </div>

          {/* Goals (Mobile version of GoalCards) */}
          <div className="p-4">
            <GoalCarouselMobile goals={mappedGoals} loading={goalsLoading} /> </div>
          </div>

        {/* Dashboard Buttons */}
        <div className="p-4">
          <ActionButtons onLoan={onLoan}/>
        </div>

        {/* Contribution Summary */}
        <div className="p-4">
          <ContributionDiv />
        </div>

        {/* ConsistencyStat */}
        <div className="p-4">
          <ConsistencyStat />
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
          <GoalCards goals={mappedGoals} />
        </div>

        {/* Bottom Right Boxes */}
        <div className="col-span-1 row-span-3 bg-secondary rounded-2xl p-4">
          <ConsistencyStat />
        </div>
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
          <DashboardBtns onLoan={onLoan}/>
        </div>
      </div>
    </main>
  );
};

export default ManagerDashboard;
