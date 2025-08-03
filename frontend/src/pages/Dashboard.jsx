import { NavLink } from "react-router-dom";
import ConsistencyStat from "../components/ConsistencyStat"
import ContributionDiv from "../components/ContributionDiv"
import DashboardBtns from "../components/DashboardBtns"
import GoalCards from "../components/GoalCards"




const Dashboard = () => {

  return (
    <main className="flex flex-col w-full h-full min-h-screen  justify-center">

        {/* Grid */}
        <div className="w-372  h-176 bg-primary mx-20 rounded-4xl grid grid-cols-3 grid-rows-[auto_auto_auto] gap-4 p-4 ">

          {/* Member List - Tall Left Box */}
            <div className=" bg-secondary rounded-2xl p-4 col-span-1">
              <p className="text-md font-bold text-primary bg-gray-200 p-3 rounded-2xl shadow-gray-300 shadow">
                Group Contribution Status
              </p>
              {/* Group Contribution Status */}
                <ContributionDiv />
            </div>

          {/* Top Right Boxes */}
          <div className=" col-span-2">
            <GoalCards />
          </div>
            

            {/* Bottom Right Wide Box */}
            <div className="col-span-1 row-span-3 bg-secondary rounded-2xl p-4">
              {/* Consistency Report and Stats */}
              <ConsistencyStat />
            </div>

              {/* Bottom Right Wide Box */}
            <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
              <DashboardBtns />
            </div>

        </div>
    </main>
  )
}

export default Dashboard