import { useEffect, useState } from "react";
import { auth } from "../lib/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { AuthRoleContext } from "../contexts/AuthRoleContext";

const AuthRoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthRoleContext.Provider value={{ user }}>
      {children}
    </AuthRoleContext.Provider>
  );
};

export default AuthRoleProvider;