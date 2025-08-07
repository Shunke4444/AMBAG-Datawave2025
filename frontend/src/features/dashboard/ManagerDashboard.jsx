import ConsistencyStat from "./ConsistencyStat";
import ContributionDiv from "./ContributionDiv";
import DashboardBtns from "./DashboardBtns";
import GoalCards from "../goals/GoalCards";
import useIsMobile from "../../hooks/useIsMobile";
import GoalCardGlassMobile from "../goals/GoalCardGlassMobile";
import GoalCarouselMobile from "../goals/GoalCarouselMobile";
import RecentActivity from "./RecentActivity";

const ManagerDashboard = () => {
  const isUseMobile = useIsMobile();

  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        {/* Header */}
        <div className="bg-primary text-white px-4 pt-6 pb-4 rounded-b-3xl">
          <div className="mt-2">
            <p className="text-sm">Balance</p>
            <h2 className="text-3xl font-bold">₱123,456</h2>
          </div>

          {/* Goals (Mobile version of GoalCards) */}
          <div className="p-4">
            <GoalCarouselMobile />
          </div>
        </div>

        {/* Dashboard Buttons */}
        <div className="p-4">
          <DashboardBtns />
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
      <div className="w-372 h-176 bg-primary mx-20 rounded-4xl grid grid-cols-3 grid-rows-[auto_auto_auto] gap-4 p-4">
        {/* Member List - Tall Left Box */}
        <div className="bg-secondary rounded-2xl p-4 col-span-1">
          <p className="text-md font-bold text-primary bg-gray-200 p-3 rounded-2xl shadow-gray-300 shadow">
            Group Contribution Status
          </p>
          <ContributionDiv />
        </div>

        {/* Top Right Boxes */}
        <div className="col-span-2">
          <GoalCards />
        </div>

        {/* Bottom Right Boxes */}
        <div className="col-span-1 row-span-3 bg-secondary rounded-2xl p-4">
          <ConsistencyStat />
        </div>
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
          <DashboardBtns />
        </div>
      </div>
    </main>
  );
};

export default ManagerDashboard;
