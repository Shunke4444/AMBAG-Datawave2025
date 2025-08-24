import { Modal } from "@mui/material";
import { useNavigate } from "react-router-dom";

const GoalCreated = ({ 
  open, 
  onClose, 
  goal, 
  isPending = false 
}) => {
  const navigate = useNavigate();
  
  if (!goal) return null;
  
  const formatDeadline = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
          <h2 className="text-lg font-bold text-green-600 mb-2">
            {isPending ? "⏳ Goal Submitted!" : "🎉 Goal Created!"}
          </h2>
          <p className="text-gray-700 mb-4">
            {isPending ? (
              <>Your goal <span className="font-semibold">{goal.title}</span> ({goal.goal_type})
              has been submitted for approval with a target of{" "}
              <span className="font-semibold">₱{goal.goal_amount.toLocaleString()}</span> by{" "}
              <span className="font-semibold">{formatDeadline(goal.target_date)}</span>.</>
            ) : (
              <>Your goal <span className="font-semibold">{goal.title}</span> ({goal.goal_type})
              has been created successfully with a target of{" "}
              <span className="font-semibold">₱{goal.goal_amount.toLocaleString()}</span> by{" "}
              <span className="font-semibold">{formatDeadline(goal.target_date)}</span>.</>
            )}
          </p>
          <div className="flex justify-end gap-2 mt-6">
            {isPending && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/app/requests-approval');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                View Pending Approvals
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GoalCreated;