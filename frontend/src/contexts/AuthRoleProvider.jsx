import { useEffect, useState } from "react";
import { AuthRoleContext } from "../contexts/AuthRoleContext";
import { auth } from "../lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";

const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authRole, setAuthRole] = useState(null);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    // Also restore role from localStorage
    const role = localStorage.getItem("authRole");
    if (role) setAuthRole(role);
    return () => unsubscribe();
  }, []);

  const setAndStoreAuthRole = (role) => {
    localStorage.setItem("authRole", role);
    setAuthRole(role);
  };

  return (
    <AuthRoleContext.Provider value={{ user, authRole, setAuthRole: setAndStoreAuthRole }}>
      {children}
    </AuthRoleContext.Provider>
  );
};

export default AuthRoleProvider;
