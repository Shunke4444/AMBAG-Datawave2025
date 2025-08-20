import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Modal } from '@mui/material';
import { listGoals } from '../../lib/api';
import { useMembersContext } from '../manager/contexts/MembersContext.jsx';

export default function SelectGoalModal({ open, onClose }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useMembersContext();
  // const navigate = useNavigate();

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
    // No navigation, just close modal
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Blurred and dark overlay */}
        <div className="absolute inset-0 bg-black/80 bg-opacity-60 backdrop-blur-sm transition-all" onClick={onClose} />
        {/* Modal content */}
        <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl shadow-2xl p-0">
          <section className="bg-primary rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Select a Goal to Pay</h2>
            {loading ? (
              <div className="p-8 text-center text-white">Loading goals...</div>
            ) : error ? (
              <div className="p-8 text-center text-yellow-300">{error}</div>
            ) : goals.length === 0 ? (
              <div className="text-yellow-100 text-center">No goals found.</div>
            ) : (
              <ul className="space-y-4">
                {goals.map(goal => (
                  <li key={goal.goal_id}>
                    <button
                      className="w-full text-left bg-accent rounded-xl p-4 shadow-lg hover:scale-105 transition-transform"
                      onClick={() => handleSelect(goal.goal_id)}
                    >
                      <div className="font-semibold text-lg text-gray-900">{goal.title}</div>
                      <div className="text-sm text-gray-800">Target: ₱{goal.goal_amount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-800">Deadline: {goal.target_date || 'No deadline'}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Modal>
  );
}
