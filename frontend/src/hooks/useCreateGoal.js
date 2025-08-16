import { useReducer, useState, useContext } from 'react';
import { createGoal } from '../lib/api';
import { AuthRoleContext } from '../contexts/AuthRoleContext';

export const initialGoalState = {
  goalName: "",
  goalType: "Savings",
  targetAmount: "",
  deadline: "",
  description: "",
};

export function createGoalReducer(state, action) {
  switch (action.type) {
    case "SET_GOAL_NAME":
      return { ...state, goalName: action.payload };
    case "SET_GOAL_TYPE":
      return { ...state, goalType: action.payload };
    case "SET_TARGET_AMOUNT":
      return { ...state, targetAmount: action.payload };
    case "SET_DEADLINE":
      return { ...state, deadline: action.payload };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload };
    case "RESET_FORM":
      return initialGoalState;
    default:
      return state;
  }
}

export function useCreateGoal() {
  const [state, dispatch] = useReducer(createGoalReducer, initialGoalState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userRole } = useContext(AuthRoleContext);

  const createNewGoal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!state.goalName || !state.targetAmount || !state.deadline) {
        throw new Error("Please fill in all required fields");
      }

      const creatorName = user?.profile?.first_name && user?.profile?.last_name 
        ? `${user.profile.first_name} ${user.profile.last_name}`
        : user?.email || "Unknown User";
      
      const creatorRole = userRole?.role_type || "member";

      const payload = {
        title: state.goalName,
        goal_amount: parseFloat(state.targetAmount),
        target_date: state.deadline,
        description: state.description || '',
        goal_type: state.goalType,
        creator_role: creatorRole,
        creator_name: creatorName,
        auto_payment_settings: {
          enabled: false,
          payment_method: "manual",
          require_confirmation: true,
          notification_settings: {
            notify_manager: true,
            notify_contributors: true,
            send_receipt: true
          }
        }
      };

      const result = await createGoal(payload);
      dispatch({ type: "RESET_FORM" });
      return result;
    } catch (err) {
      setError(err.message || "Failed to create goal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state,
    dispatch,
    isLoading,
    error,
    createNewGoal,
    setError
  };
}