import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import ConsistencyStat from "../components/ConsistencyStat"
import ContributionDiv from "../components/ContributionDiv"
import DashboardBtns from "../components/DashboardBtns"
import GoalCards from "../components/GoalCards"
import useIsMobile from "../hooks/useIsMobile";

import {
  Notifications as NotifyIcon,
  Settings as SettingIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';





const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
    if (isMobile) {
      
      return (
        <main className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <div className="bg-primary text-white px-4 pt-6 pb-4 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <p>Hello <span className="text-yellow-400 font-bold">Admin!</span></p>
            <div className="flex gap-4">
              <button className="cursor-pointer">
                <NotifyIcon  />
              </button >
              <button onClick={()=> navigate("/help-support")} className="cursor-pointer">
                <SupportIcon  />
              </button >
              <button onClick={() => navigate("/settings")} className="cursor-pointer">
                <SettingIcon  />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm">Balance</p>
            <h2 className="text-3xl font-bold">₱123,456</h2>
          </div>
        </div>

        {/* Goals (Mobile version of GoalCards) */}
        <div className="p-4">
          <GoalCards />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around px-4 py-2 bg-yellow-400 rounded-b-3xl">
          <button className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow">Pay Share</button>
          <button className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow">Goals</button>
          <button className="bg-white px-4 py-2 rounded-xl font-bold text-sm shadow">Deposit</button>
        </div>

        {/* Contribution Summary */}
        <div className="p-4">
          <ContributionDiv />
        </div>

        {/* ConsistencyStat */}
        <div className="p-4">
          <ConsistencyStat />
        </div>

        {/* Dashboard Buttons */}
        <div className="p-4">
          <DashboardBtns />
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