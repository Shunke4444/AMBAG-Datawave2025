import { useState, useContext } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import DashboardBtns from "./DashboardBtns";
import ActionButtons from "./ActionButtons";
import CreateGroupModal from "../groups/CreateGroupModal";
import CreateGoalModal from "../goals/CreateGoalModal";
import { AuthRoleContext } from "../../contexts/AuthRoleContext";

import {
  Add as AddIcon,
} from '@mui/icons-material';
import MemberHeader from "../members/MemberHeader";

const NewUserDashboard = () => {

  const isUseMobile = useIsMobile();
  const { user, userRole } = useContext(AuthRoleContext);

  // State for modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const handleCreateGoal = async (goalData) => {
    try {
      // Import createGoal directly from api
      const { createGoal } = await import("../../lib/api");
      
      // Get creator name from user profile
      const creatorName = user?.profile?.first_name && user?.profile?.last_name 
        ? `${user.profile.first_name} ${user.profile.last_name}`
        : user?.email || "Unknown User";
      
      // Get creator role - temporarily hardcode as manager for testing
      const creatorRole = "manager"; // userRole?.role_type || "member";
      
      // Add required fields to the payload
      const completeGoalData = {
        ...goalData,
        creator_role: creatorRole,
        creator_name: creatorName,
        auto_payment_settings: {
          enabled: false,
          payment_method: "manual",
          require_confirmation: true,
          notification_settings: {
            notify_manager: true,
            notify_contributors: true,
            send_receipt: true
          }
        }
      };
      
      const result = await createGoal(completeGoalData);
      return result;
    } catch (error) {
      throw error;
    }
  };


  if (isUseMobile) {
    return (
      <main className="flex flex-col min-h-screen bg-white mb-16">
        {/* Header */}
        <div className="bg-primary text-white px-4 pb-4 rounded-b-3xl">
          <div className="my-4">
            <MemberHeader />
          </div>

            <div className="flex flex-col items-center justify-center gap-8 bg-shadow rounded-xl px-6 py-12 shadow-md mb-4">
            <p className="text-secondary text-center text-sm sm:text-base md:text-lg">
              Goals are Empty
            </p>
            <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm md:text-base px-4 py-2 rounded-xl cursor-pointer" onClick={() => setIsGoalModalOpen(true)}>
              <AddIcon className="text-white text-sm sm:text-base" />
              <span>Create a Goal</span>
            </button>
          </div>
        </div>

        {/* Dashboard Buttons */}
        <div className="p-4">
          <ActionButtons />
        </div>

        {/* Empty Group Placeholder */}
        <div className="p-32 mx-4 mt-6 rounded-2xl outline-1 outline-gray-200 shadow-md bg-white flex flex-col items-center justify-center gap-6">
          <p className="text-textcolor text-center text-sm sm:text-base md:text-lg">
            You are not in a group yet
          </p>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-textcolor text-xs sm:text-sm md:text-base px-3 py-2 rounded-xl cursor-pointer" onClick={() => setIsGroupModalOpen(true)}>
            <AddIcon className="text-textcolor text-sm sm:text-base" />
            <span>Create a Group</span>
          </button>
        </div>

        {/* ConsistencyStat - Empty for now */}
        <div className="p-4"></div>

          {isGroupModalOpen && (
            <CreateGroupModal
              isOpen={isGroupModalOpen}
              onClose={() => setIsGroupModalOpen(false)}
            />
          )}
          {isGoalModalOpen && (
              <CreateGoalModal
                open={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onCreateGoal={handleCreateGoal}
              />
            )}

      </main>
    );
  }

  // Desktop Layout
  return (
    <main className="flex flex-col w-full h-full min-h-screen justify-center">
      <div className="w-372 h-176 bg-primary mx-20 rounded-4xl grid grid-cols-3 grid-rows-[auto_auto_auto] gap-4 p-4">
        {/* Member List - Tall Left Box */}
        <div className="bg-shadow rounded-2xl p-4 col-span-1 flex items-center justify-center">
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-textcolor text-xs sm:text-sm md:text-base px-3 py-2 rounded-xl cursor-pointer" onClick={() => setIsGroupModalOpen(true)}>
            <AddIcon className="text-textcolor text-sm sm:text-base" />
            <span>Create a Group</span>
          </button>
        </div>

        {/* Top Right Boxes */}
        <div className="col-span-2 bg-shadow rounded-2xl p-4 h-120 flex items-center justify-center">
          <button className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-xs sm:text-sm md:text-base px-4 py-2 rounded-xl cursor-pointer"   onClick={() => setIsGoalModalOpen(true)}>
            <AddIcon className="text-white text-sm sm:text-base" />
            <span>Create a Goal</span>
          </button>
        </div>


        {/* Bottom Right Boxes */}
        <div className="col-span-1 row-span-3 bg-shadow rounded-2xl p-4">
          
        </div>
        <div className="col-span-2 row-span-3 bg-secondary rounded-2xl p-4">
          <DashboardBtns />
        </div>
      </div>

      {isGroupModalOpen && (
        <CreateGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
        />
      )}

      {isGoalModalOpen && (
          <CreateGoalModal
            open={isGoalModalOpen}
            onClose={() => setIsGoalModalOpen(false)}
            onCreateGoal={handleCreateGoal}
          />
        )}

    </main>
  );
};

export default NewUserDashboard;
