import { useState } from "react";
import { Modal } from "@mui/material";
import useCreateGroup from "../../hooks/useCreateGroup";
import GroupCreated from "./GroupCreated";

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
  const { state, setField, resetForm } = useCreateGroup();
  const [groupCreated, setGroupCreated] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);

  const handleCreate = () => {
    const {
      groupName,
      totalMembers,
      groupPurpose,
      groupType,
      minContribution,
      contributionFrequency,
    } = state;

    if (
      !groupName.trim() ||
      !totalMembers ||
      !groupPurpose ||
      !groupType ||
      !minContribution ||
      !contributionFrequency
    ) {
      alert("Please fill out all fields.");
      return;
    }

    const newGroup = {
      name: groupName,
      members: Number(totalMembers),
      purpose: groupPurpose,
      type: groupType,
      minContribution: Number(minContribution),
      contributionFrequency,
      role: "Manager",
      inviteLink: `${window.location.origin}/invite/${crypto.randomUUID()}`,
    };

    if (onCreate) onCreate(newGroup);

    setCreatedGroup(newGroup); // Store the created group details
    setGroupCreated(true); // Show success modal
    resetForm();
  };

  const handleCloseGroupCreated = () => {
    setGroupCreated(false);
    setCreatedGroup(null);
    onClose(); // Close the main modal after success popup closes
  };

  return (
    <>
      {/* Main Create Group Modal */}
      <Modal open={isOpen && !groupCreated} onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-bold text-primary mb-4">
              Create New Group
            </h2>

            <div className="flex flex-col gap-4">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={state.groupName}
                  onChange={(e) => setField("groupName", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Total Members */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Members
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={state.totalMembers}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setField("totalMembers", value);
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  placeholder="Enter number of members"
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose
                </label>
                <textarea
                  value={state.groupPurpose}
                  onChange={(e) => setField("groupPurpose", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Group Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Type
                </label>
                <select
                  value={state.groupType}
                  onChange={(e) => setField("groupType", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select type</option>
                  <option value="Savings">Savings</option>
                  <option value="Bills">Bills</option>
                  <option value="Investments">Investments</option>
                </select>
              </div>

              {/* Min Contribution */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimum Contribution
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={state.minContribution}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setField("minContribution", value);
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                  placeholder="Enter minimum amount"
                />
              </div>

              {/* Contribution Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contribution Frequency
                </label>
                <select
                  value={state.contributionFrequency}
                  onChange={(e) =>
                    setField("contributionFrequency", e.target.value)
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select frequency</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Group Created Success Modal */}
      {groupCreated && createdGroup && (
        <GroupCreated
          open={groupCreated}
          onClose={handleCloseGroupCreated}
          groupName={createdGroup.name}
          inviteLink={createdGroup.inviteLink}
        />
      )}
    </>
  );
};

export default CreateGroupModal;
