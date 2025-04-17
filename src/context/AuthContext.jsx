import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    const role = Cookies.get("role");

    if (accessToken && role) {
      setIsAuthenticated(true);
      setUser({ role, is_superuser: role === "admin" });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("role");
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const updateAuthState = (data) => {
    if (data.access && data.refresh && data.role) {
      Cookies.set("access_token", data.access, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set("refresh_token", data.refresh, { secure: true, sameSite: 'Strict', expires: 7 });
      Cookies.set("role", data.role, { secure: true, sameSite: 'Strict', expires: 7 });
      setIsAuthenticated(true);
      setUser({ role: data.role, is_superuser: data.role === "admin" });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        logout,
        updateAuthState,
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