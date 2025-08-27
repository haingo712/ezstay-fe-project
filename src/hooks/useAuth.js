// src/hooks/useAuth.js - Custom hook for authentication

import { useState, useEffect } from "react";
import authService from "@/services/authService";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const userInfo = authService.getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.Success) {
        setIsAuthenticated(true);
        const userInfo = authService.getUserInfo();
        setUser(userInfo);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log("useAuth: Calling authService.register with:", userData);
      const result = await authService.register(userData);
      console.log("useAuth: Received result from authService:", result);
      return result;
    } catch (error) {
      console.error("useAuth: Error during registration:", error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    role: user?.role || null,
    loading,
    login,
    register,
    logout,
  };
}
