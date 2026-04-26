import { createContext, useContext, useState, useEffect } from "react";
import { fetchUser as apiFetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      const userData = await apiFetchUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  };

  const logoutAll = async () => {
    try {
      await logoutAllSessions();
      setUser(null);
      toast.success("Logged out from all sessions successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Logout All failed", err);
      toast.error("Logout from all sessions failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        loadUser,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
