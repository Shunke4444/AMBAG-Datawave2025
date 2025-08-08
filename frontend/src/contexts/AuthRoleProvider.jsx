
import { useEffect, useState } from "react";
import { AuthRoleContext } from "../contexts/AuthRoleContext";

const AuthRoleProvider = ({ children }) => {
  const [authRole, setAuthRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("authRole");
    if (role) setAuthRole(role);
  }, []);

  const setAndStoreAuthRole = (role) => {
    localStorage.setItem("authRole", role);
    setAuthRole(role);
  };

  return (
    <AuthRoleContext.Provider value={{ authRole, setAuthRole: setAndStoreAuthRole }}>
      {children}
    </AuthRoleContext.Provider>
  );
};

export default AuthRoleProvider;
