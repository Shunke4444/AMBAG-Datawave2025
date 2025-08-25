import { useState, useContext } from "react";
import { Add as AddIcon } from "@mui/icons-material";
import GoalInfo from "./GoalInfo";
import CreateGoalModal from "./CreateGoalModal";
import { AuthRoleContext } from "../../contexts/AuthRoleContext";

const GoalsPage = () => {
  const { authRole } = useContext(AuthRoleContext);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // normalize role to lowercase for checks
  const normalizedRole = authRole?.toLowerCase() || null;
  const isManager = normalizedRole === "manager";
  const isMember = normalizedRole === "member";
  const isContributor = normalizedRole === "contributor";

  console.log("🔍 GoalsPage: authRole:", authRole, "normalized:", normalizedRole);

  const handleCreateGoal = async (goalData) => {
    console.log("🎯 GoalsPage: handleCreateGoal called with:", goalData);
    try {
      const { createGoal } = await import("../../lib/api");
      const completeGoalData = {
        ...goalData,
        auto_payment_settings: goalData.auto_payment_settings || {
          enabled: false,
          payment_method: "manual",
          require_confirmation: true,
          notification_settings: {
            notify_manager: true,
            notify_contributors: true,
            send_receipt: true,
          },
        },
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
        <div className="bg-primary rounded-4xl flex flex-col gap-4 w-full max-w-7xl mx-auto p-6 sm:p-8">
          {/* Header Add Goal button */}
          <header className="flex justify-end p-8">
            {isManager && (
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="cursor-pointer"
              >
                <span className="text-secondary font-semibold text-sm mr-5">
                  Add Goal
                </span>
                <AddIcon className="text-secondary" />
              </button>
            )}
          </header>

          {/* Goal rendering */}
          {normalizedRole ? (
            <div className="w-full flex justify-center">
              <GoalInfo />
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-secondary/60">
              Welcome! Please contact your manager to get a role assigned.
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
