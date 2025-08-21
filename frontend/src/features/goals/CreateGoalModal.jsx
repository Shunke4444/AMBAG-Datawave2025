
import { useReducer, useState } from "react";
import { Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { initialGoalState, createGoalReducer } from "../../hooks/useCreateGoal";
import GoalCreated from "./GoalCreated";
import { useMembersContext } from "../../features/manager/contexts/MembersContext.jsx";
import { useEffect } from "react";
const CreateGoalModal = ({ open, onClose, onCreateGoal }) => {
    // Debug: Track when modal is mounted and opened
    console.log('CreateGoalModal mounted. open:', open);
  
  const [state, dispatch] = useReducer(createGoalReducer, initialGoalState);
  // Use MembersContext to get user and group_id

  const { members, loading, groupId } = useMembersContext();
  // Get current Firebase user UID
  const [firebaseUid, setFirebaseUid] = useState(null);
  useEffect(() => {
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth();
      setFirebaseUid(auth.currentUser?.uid || null);
    });
  }, []);

  // Find the member that matches the current Firebase UID
  const user = members.find(m => m.firebase_uid === firebaseUid) || {};
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [error, setError] = useState(null);
  const [createdGoal, setCreatedGoal] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🎯 CreateGoalModal: Form submitted");
    console.log("📋 Current state:", state);
    
    try {
      // Validate required fields
      if (!state.goalName || !state.targetAmount || !state.deadline) {
        const missingFields = [];
        if (!state.goalName) missingFields.push("goalName");
        if (!state.targetAmount) missingFields.push("targetAmount");
        if (!state.deadline) missingFields.push("deadline");
        console.error("❌ Missing required fields:", missingFields);
        throw new Error("Please fill in all required fields");
      }

      const goalData = {
        firebase_uid: user?.firebase_uid ?? "",
        title: state.goalName ?? "",
        goal_amount: parseFloat(state.targetAmount),
        target_date: state.deadline ?? "",
        description: state.description ?? "",
        goal_type: state.goalType ?? "",
        group_id: (groupId ?? user?.group_id ?? ""),
        creator_role: user?.role ?? "",
        creator_name:
          (user?.name && typeof user.name === "string" && user.name.trim() !== "") ? user.name :
          (user?.first_name || user?.last_name) ? `${user.first_name || ""} ${user.last_name || ""}`.trim() :
          (typeof user?.email === "string" && user.email.trim() !== "") ? user.email :
          ""
      };
      
      // Log all required fields to verify they are valid strings
      console.log("📝 CreateGoalModal: Calling onCreateGoal with:", goalData);
      console.log("Field check:", {
        title: typeof goalData.title,
        group_id: typeof goalData.group_id,
        goal_type: typeof goalData.goal_type,
        creator_role: typeof goalData.creator_role,
        creator_name: typeof goalData.creator_name,
        target_date: typeof goalData.target_date,
        description: typeof goalData.description
      });
      console.log("🔗 onCreateGoal function:", typeof onCreateGoal);
      
      if (typeof onCreateGoal !== 'function') {
        console.error("❌ onCreateGoal is not a function:", onCreateGoal);
        throw new Error("Goal creation function not available");
      }
      
      const result = await onCreateGoal(goalData);
      console.log("✅ CreateGoalModal: Got result:", result);

      // Handle both direct goal creation and pending approval cases
      if (result.status === "pending_approval" || result.status === "pending") {
        setIsPending(true);
        setCreatedGoal({
          title: state.goalName,
          goal_amount: parseFloat(state.targetAmount),
          target_date: state.deadline,
          goal_type: state.goalType,
          status: "pending_approval"
        });
      } else {
        setIsPending(false);
        setCreatedGoal({
          ...result,
          title: result.title || state.goalName,
          goal_amount: result.goal_amount || parseFloat(state.targetAmount),
          target_date: result.target_date || state.deadline,
          goal_type: result.goal_type || state.goalType
        });
      }
      
      setIsSuccessOpen(true);
    } catch (err) {
      console.error("❌ CreateGoalModal: Error occurred:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      console.error("❌ Full error object:", err);
      
      const errorMessage = err.response?.data?.detail || err.message || "Failed to create goal";
      setError(errorMessage);
      console.error("❌ Final error message shown to user:", errorMessage);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    onClose();
    dispatch({ type: "RESET_FORM" });
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-bold mb-4">Create Goal</h2>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {typeof error === "string"
                  ? error
                  : Array.isArray(error)
                  ? error.map((e, i) => <div key={i}>{e.msg || JSON.stringify(e)}</div>)
                  : error.msg || JSON.stringify(error)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                  <input
                    type="text"
                    placeholder="Enter goal name"
                    value={state.goalName}
                    onChange={(e) =>
                      dispatch({ type: "SET_GOAL_NAME", payload: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                  <select
                    value={state.goalType}
                    onChange={(e) =>
                      dispatch({ type: "SET_GOAL_TYPE", payload: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select Goal Type</option>
                    <option value="Savings">Savings</option>
                    <option value="Bills">Bills</option>
                    <option value="Investment">Investment</option>
                    <option value="Debt Payment">Debt Payment</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <input
                    type="number"
                    placeholder="Enter target amount"
                    value={state.targetAmount}
                    onChange={(e) =>
                      dispatch({ type: "SET_TARGET_AMOUNT", payload: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={state.deadline}
                    onChange={(e) =>
                      dispatch({ type: "SET_DEADLINE", payload: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    placeholder="Enter description"
                    value={state.description}
                    onChange={(e) =>
                      dispatch({ type: "SET_DESCRIPTION", payload: e.target.value })
                    }
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  disabled={!state.goalName || !state.targetAmount || !state.deadline}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      <GoalCreated
        open={isSuccessOpen}
        onClose={handleSuccessClose}
        goal={createdGoal}
        isPending={isPending}
      />
    </>
  );
};

export default CreateGoalModal;
