import { createContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "../../firebase";


export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);  // Handle loading state

  // Set up an auth state listener to track user's authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);  // Set the user if authenticated
      } else {
        setCurrentUser(null);  // Set user to null if not authenticated
      }
      setLoading(false);  // Set loading to false after checking auth state
    });

    return () => unsubscribe();  // Clean up the listener on component unmount
  }, []);

  // Login function using Firebase authentication
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout function using Firebase authentication
  const logout = () => {
    return signOut(auth);
  };

  // Update the user in the context (optional)
  const updateUser = (user) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {!loading && children}  {/* Prevent children from rendering before auth state is determined */}
    </AuthContext.Provider>
  );
};
