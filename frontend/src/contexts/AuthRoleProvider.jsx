import { useEffect, useState } from "react";
import { AuthRoleContext } from "../contexts/AuthRoleContext";
import { auth } from "../lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { api } from "../lib/api";

const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authRole, setAuthRole] = useState(null);

  // Fetch role from API
  const fetchRole = async (firebaseUser) => {
    if (!firebaseUser) {
      setAuthRole(null);
      localStorage.removeItem("authRole");
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      const firebase_uid = firebaseUser.uid;
      const res = await api.get(`/users/profile/${firebase_uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const role_type = res?.data?.role?.role_type;
      
      let role;
      if (role_type === "manager") role = "Manager";
      else if (role_type === "contributor") role = "Member";
      else role = "NewUser";
      
      setAuthRole(role);
      localStorage.setItem("authRole", role);
      console.log("AuthRoleProvider: Fetched role:", role);
    } catch (error) {
      console.error("AuthRoleProvider: Error fetching role:", error);
      // Fallback to localStorage if API fails
      const storedRole = localStorage.getItem("authRole");
      if (storedRole) setAuthRole(storedRole);
    }
  };

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        fetchRole(firebaseUser);
      } else {
        setAuthRole(null);
        localStorage.removeItem("authRole");
      }
    });
    
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
