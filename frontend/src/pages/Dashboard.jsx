import ConsistencyStat from "../components/ConsistencyStat"
import ContributionDiv from "../components/ContributionDiv"
import DashboardBtns from "../components/DashboardBtns"
import GoalCards from "../components/GoalCards"

import {
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';


const Dashboard = () => {

  return (
    <main className="flex flex-col w-full h-full min-h-screen mx-12">
        <div>
          <h1 className="text-xl font-bold text-textcolor px-20 py-16">
            Dashboard
          </h1>
          {/* notif, settings , help supp  */}

            

        </div>
        
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