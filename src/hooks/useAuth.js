// src/hooks/useAuth.js - Custom hook for authentication
import { useState, useEffect } from "react";
import AuthService from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On initial load, check if there's a token and get user info
    const currentUser = AuthService.getUserInfo();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    const result = await AuthService.login(credentials);
    if (result.success) {
      // After a successful login, the authService has stored the token.
      // We can now get the user info from the service, which decodes the new token.
      const currentUser = AuthService.getUserInfo();
      setUser(currentUser);
      setIsAuthenticated(true);
    } else {
      // If login fails, ensure user state is cleared
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
    return result;
  };

  const register = async (userData) => {
    // The register function in authService handles the API call.
    // This hook just acts as a pass-through.
    return await AuthService.register(userData);
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    role: user?.role || null,
  };
}
