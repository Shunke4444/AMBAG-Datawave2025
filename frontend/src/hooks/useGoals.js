import { useState, useEffect, useContext } from 'react';
import { createGoal, listGoals, deleteGoal } from '../lib/api';
import { AuthRoleContext } from '../contexts/AuthRoleContext';

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userRole } = useContext(AuthRoleContext);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const fetchedGoals = await listGoals();
      setGoals(fetchedGoals);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const createNewGoal = async (goalData) => {
    try {
      setLoading(true);
      const creatorName = user?.profile?.name || user?.email || "Unknown";
      const creatorRole = userRole?.role_type || "member";
      
      const newGoal = await createGoal({
        ...goalData,
        creator_name: creatorName,
        creator_role: creatorRole,
        target_date: new Date(goalData.target_date).toISOString()
      });

      if (newGoal.status !== "pending") {
        setGoals(prev => [...prev, newGoal]);
      }
      
      return newGoal;
    } catch (err) {
      setError(err.message || "Failed to create goal");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeGoal = async (goalId) => {
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.goal_id !== goalId));
    } catch (err) {
      setError(err.message || "Failed to delete goal");
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createNewGoal,
    removeGoal
  };
}