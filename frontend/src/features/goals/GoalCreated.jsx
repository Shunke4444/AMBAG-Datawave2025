import { Modal } from "@mui/material";

const GoalCreated = ({ open, onClose, goalName, goalType, targetAmount, deadline }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
          <h2 className="text-lg font-bold text-green-600 mb-2">🎉 Goal Created!</h2>
          <p className="text-gray-700 mb-4">
            Your goal <span className="font-semibold">{goalName}</span> ({goalType})
            has been created successfully with a target of{" "}
            <span className="font-semibold">{targetAmount}</span> by{" "}
            <span className="font-semibold">{deadline}</span>.
          </p>
          <div className="flex justify-end mt-6">
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
