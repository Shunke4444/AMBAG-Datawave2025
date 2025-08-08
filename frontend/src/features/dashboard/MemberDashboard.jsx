
import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import useIsMobile from "../../hooks/useIsMobile";
import RecentActivity from "./RecentActivity";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import MemberPage from "../../features/members/MemberPage";

const MemberDashboard = () => {
  
  const isUseMobile = useIsMobile();
  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        <MemberPage />
      </main>
    );
  }

  // Desktop Layout
  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-center">
      <div className="w-372 h-192 bg-primary mx-20 rounded-4xl grid grid-cols-3 grid-rows-[auto_auto_auto] gap-4 p-4">
        {/* Member List - Tall Left Box */}
        <div className="bg-secondary rounded-2xl p-4 col-span-1">
          <ContributionDiv />
        </div>

        {/* Top Right Boxes */}
        <div className="col-span-2">
          <GoalCards />
        </div>

        {/* Bottom Right Boxes */}
        <div className="col-span-1 row-span-3 bg-secondary rounded-2xl">
          <ConsistencyStat />
        </div>
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl">
          <DashboardBtns />
        </div>
      </div>
    </main>
  )
}

export default MemberDashboard