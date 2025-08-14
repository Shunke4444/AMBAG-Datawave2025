import { useReducer } from "react";

const initialState = {
  groupName: "",
  totalMembers: "",
  groupPurpose: "",
  groupType: "",
  minContribution: "",
  contributionFrequency: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function useCreateGroupForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setField = (field, value) => {
    dispatch({ type: "SET_FIELD", field, value });
  };

  const resetForm = () => {
    dispatch({ type: "RESET" });
  };

  return {
    state,
    setField,
    resetForm,
  };
}
  