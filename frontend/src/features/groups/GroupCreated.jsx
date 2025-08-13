import { Modal } from "@mui/material"

const GroupCreated = ({ open, onClose, groupName, inviteLink }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied!");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
          {/* Header */}
          <h2 className="text-lg font-bold text-green-600 mb-2">
            🎉 Group Created!
          </h2>
          <p className="text-gray-700 mb-4">
            Your group <span className="font-semibold">{groupName}</span> has been
            created successfully. You are the <span className="font-semibold">Manager</span>.
          </p>

          {/* Invite Link */}
          <div className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
            <span className="text-sm text-gray-800 truncate">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className="ml-2 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary/80"
            >
              Copy
            </button>
          </div>

          {/* Actions */}
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

export default GroupCreated;
