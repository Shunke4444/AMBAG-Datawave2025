import { createContext, useContext, useState, useEffect } from "react";

// ✅ Correct Context name
const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("authRole");
    setAuthRole(role);
  }, []);

  // ✅ Make sure return is inside the function
  return (
    <AuthRoleContext.Provider value={{ authRole, setAuthRole }}>
      {children}
    </AuthRoleContext.Provider>
  );
};

// ✅ Custom hook to use this context
export const useUserRole = () => useContext(AuthRoleContext);
