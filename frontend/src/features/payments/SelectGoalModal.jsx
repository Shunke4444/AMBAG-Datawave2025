import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@mui/material';
import { listGoals } from '../../lib/api';
import { useMembersContext } from '../manager/contexts/MembersContext.jsx';

export default function SelectGoalModal({ open, onClose }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useMembersContext();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const data = await listGoals(groupId);
        setGoals(data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch goals');
      } finally {
        setLoading(false);
      }
    }
    if (open && groupId) fetchGoals();
  }, [open, groupId]);

  const handleSelect = (goalId) => {
    onClose();
    navigate(`/payment/${goalId}`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Select a Goal to Pay</h2>
          {loading ? (
            <div className="p-8 text-center">Loading goals...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : goals.length === 0 ? (
            <div className="text-gray-500 text-center">No goals found.</div>
          ) : (
            <ul className="space-y-4">
              {goals.map(goal => (
                <li key={goal.goal_id}>
                  <button
                    className="w-full text-left bg-white border rounded-lg p-4 shadow hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleSelect(goal.goal_id)}
                  >
                    <div className="font-semibold text-lg">{goal.title}</div>
                    <div className="text-sm text-gray-600">Target: ₱{goal.goal_amount?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Deadline: {goal.target_date || 'No deadline'}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
