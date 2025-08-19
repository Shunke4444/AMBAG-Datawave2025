import { useState, useContext } from 'react';
import { Add as AddIcon } from '@mui/icons-material';
import GoalInfo from './GoalInfo';
import CreateGoalModal from './CreateGoalModal';
import { AuthRoleContext } from '../../contexts/AuthRoleContext';

const GoalsPage = () => {
  const { user, userRole } = useContext(AuthRoleContext);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const authRole = userRole?.role_type || "Manager";
  console.log("🔍 GoalsPage: Current authRole:", authRole, "userRole:", userRole);
  console.log("🔍 GoalsPage: Can create goals?", ["Manager", "Member", "manager", "member", "contributor"].includes(authRole));

  const handleCreateGoal = async (goalData) => {
    console.log("🎯 GoalsPage: handleCreateGoal called with:", goalData);
    try {
      const { createGoal } = await import("../../lib/api");
      const creatorName =
        user?.profile?.first_name && user?.profile?.last_name
          ? `${user.profile.first_name} ${user.profile.last_name}`
          : user?.email || "Unknown User";

      const creatorRole = userRole?.role_type === "manager" ? "manager" : "member";
      console.log("👤 Creator details:", { creatorName, creatorRole });

      const completeGoalData = {
        ...goalData,
        group_id: user?.group_id,
        creator_role: creatorRole,
        creator_name: creatorName,
        auto_payment_settings: goalData.auto_payment_settings || {
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

      console.log("📝 Complete goal data being sent:", completeGoalData);
      const result = await createGoal(completeGoalData);
      console.log("✅ Goal creation result:", result);
      return result;
    } catch (error) {
      console.error("❌ Goal creation error:", error);
      throw error;
    }
  };

  return (
    <>
      <main className="flex flex-col w-full h-full min-h-screen justify-center">
        <div className="bg-primary rounded-4xl flex flex-col justify-start gap-4
                w-full max-w-3xl mx-auto p-6 sm:p-8">
          <header className="flex justify-end p-8">
            {["Manager", "Member", "manager", "member", "contributor"].includes(authRole) && (
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="cursor-pointer"
              >
                <AddIcon className="text-secondary" />
              </button>
            )}
          </header>

          {/* Show goal cards only for Manager, Member, or contributor */}
          {["Manager", "Member", "manager", "member", "contributor"].includes(authRole) ? (
            <GoalInfo />
          ) : (
            <div className="flex justify-center items-center h-full text-secondary/60">
              No goals created yet
            </div>
          )}
        </div>
      </main>

      {isGoalModalOpen && (
        <CreateGoalModal
          open={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          onCreateGoal={handleCreateGoal}
        />
      )}
    </>
  );
};

export default GoalsPage;
