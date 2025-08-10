import { useReducer, useState } from "react";
import { Modal } from "@mui/material";
import { initialGoalState, createGoalReducer } from "../../hooks/useCreateGoal";
import GoalCreated from "./GoalCreated";

const CreateGoalModal = ({ onClose }) => {
  const [state, dispatch] = useReducer(createGoalReducer, initialGoalState);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Open success modal
    setIsSuccessOpen(true);
  };

  const handleSuccessClose = () => {
  setIsSuccessOpen(false);
  onClose(); // now close the form modal after success modal closes
};

  return (
    <>
      {/* Goal Creation Modal */}
      <Modal open={true} onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-bold mb-4">Create Goal</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Goal Name"
                value={state.goalName}
                onChange={(e) =>
                  dispatch({ type: "SET_GOAL_NAME", payload: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />

              <select
                value={state.goalType}
                onChange={(e) =>
                  dispatch({ type: "SET_GOAL_TYPE", payload: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">Select Goal Type</option>
                <option value="Savings">Savings</option>
                <option value="Bills">Bills</option>
                <option value="Investment">Investment</option>
                <option value="Debt Payment">Debt Payment</option>
                <option value="Others">Others</option>
              </select>

              <input
                type="text"
                placeholder="Target Amount"
                value={state.targetAmount}
                onChange={(e) =>
                  dispatch({ type: "SET_TARGET_AMOUNT", payload: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />

              <input
                type="date"
                value={state.deadline}
                onChange={(e) =>
                  dispatch({ type: "SET_DEADLINE", payload: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg"
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
      goalName={state.goalName}
      goalType={state.goalType}
      targetAmount={state.targetAmount}
      deadline={state.deadline}
    />
    </>
  );
};

export default CreateGoalModal;
