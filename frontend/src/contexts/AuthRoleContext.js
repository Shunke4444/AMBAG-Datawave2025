import { createContext, useContext } from "react";

export const AuthRoleContext = createContext(null);

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) throw new Error("useAuthRole must be used within AuthRoleProvider");
  return context;
};
