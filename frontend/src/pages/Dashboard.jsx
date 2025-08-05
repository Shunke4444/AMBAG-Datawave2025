

import ConsistencyStat from "../components/ConsistencyStat"
import ContributionDiv from "../components/ContributionDiv"
import DashboardBtns from "../components/DashboardBtns"
import GoalCards from "../components/GoalCards"
import useIsMobile from "../hooks/useIsMobile";



const Dashboard = () => {

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
              <GoalCards />
            </div>
        </div>

         {/* Dashboard Buttons */}
        <div className="p-4">
          <DashboardBtns />
        </div>

        {/* Contribution Summary */}
        <h1 className="text-md text-textcolor mx-8 mt-12">Recent Activity</h1>
        <div className="px-4">
          <ContributionDiv />
        </div>

        {/* ConsistencyStat */}
        <div className="p-4">
          <ConsistencyStat />
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2">
          <button className="flex flex-col items-center text-primary text-xs">🏠<span>Home</span></button>
          <button className="flex flex-col items-center text-gray-400 text-xs">📩<span>Requests</span></button>
          <button className="flex flex-col items-center text-gray-400 text-xs">👥<span>Members</span></button>
        </nav>
      </main>
      )
    }


  return (

    <main 
    className="flex flex-col w-full h-full min-h-screen justify-center">

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