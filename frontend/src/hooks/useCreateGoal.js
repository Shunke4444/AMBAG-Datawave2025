export const initialGoalState = {
  goalName: "",
  goalType: "Savings",
  targetAmount: "",
  deadline: "",
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
    case "RESET_FORM":
      return initialGoalState;
    default:
      return state;
  }
}
