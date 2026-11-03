import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fittrack_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("fittrack_token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("fittrack_token");
      if (!storedToken) {
        return;
      }

      try {
        const res = await authAPI.getMe();
        setUser(res.data);
        localStorage.setItem("fittrack_user", JSON.stringify(res.data));
      } catch (err) {
        // Only invalidate if the server explicitly rejected the token with 401
        if (err.response && err.response.status === 401) {
          console.warn("Session expired or invalid, logging out.");
          clearSession();
        } else {
          console.warn("Could not verify session in background, using cached profile:", err.message);
        }
      }
    };

    verifyUser();
  }, []);

  const clearSession = () => {
    localStorage.removeItem("fittrack_token");
    localStorage.removeItem("fittrack_user");
    setToken(null);
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { access_token, user: userData } = res.data;

      localStorage.setItem("fittrack_token", access_token);
      localStorage.setItem("fittrack_user", JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      toast.success(`Welcome back, ${userData.username}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    try {
      await authAPI.register({ username, email, password });
      toast.success("Account created successfully! Please log in.");
      return { success: true, email };
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    clearSession();
    toast.info("Logged out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
