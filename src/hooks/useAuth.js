// src/hooks/useAuth.js - Custom hook for authentication
import { useState, useEffect, useCallback } from "react";
import AuthService from "@/services/authService";
import profileService from "@/services/profileService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refresh user info from token
  const refreshUserInfo = useCallback(async (loadAvatar = false) => {
    const currentUser = AuthService.getUserInfo();
    console.log("🔄 Refreshing user info:", currentUser);

    if (currentUser && currentUser.role) {
      // Only load avatar if explicitly requested
      if (loadAvatar) {
        try {
          const profileData = await profileService.getProfile();
          if (profileData) {
            currentUser.avatar = profileData.avata || null;
            console.log("🖼️ Loaded user avatar:", currentUser.avatar);
          } else {
            currentUser.avatar = null;
            console.log("📝 No profile found for user, avatar not loaded.");
          }
        } catch (err) {
          console.log("⚠️ Could not load user avatar:", err.message);
          currentUser.avatar = null;
        }
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      console.log("✅ User authenticated with role:", currentUser.role);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      console.log("❌ No valid user found");
    }
  }, []);

  useEffect(() => {
    // On initial load, check if there's a token and get user info
    console.log("🚀 useAuth: Initial authentication check");
    refreshUserInfo(false); // Don't load avatar on initial load to avoid 401 errors
    setLoading(false);
  }, [refreshUserInfo]);

  const login = async (credentials) => {
    setLoading(true);
    console.log("🔑 Login attempt for:", credentials.email);

    const result = await AuthService.login(credentials);

    if (result.success) {
      console.log("✅ Login successful, refreshing user info...");

      // Refresh user info immediately and await it
      await refreshUserInfo();
      setLoading(false);
      console.log("🔄 Auth state updated after login");
    } else {
      console.log("❌ Login failed:", result.message);
      // If login fails, ensure user state is cleared
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }

    return result;
  };

  const register = async (userData) => {
    // The register function in authService handles the API call.
    // This hook just acts as a pass-through.
    return await AuthService.register(userData);
  };

  const logout = () => {
    console.log("🚪 useAuth: Starting logout process");

    // Clear authentication service data first
    AuthService.logout();

    // Immediately clear state to prevent any race conditions
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);

    // Redirect directly to login page
    console.log("✅ useAuth: Logout completed, redirecting to login");
    window.location.href = '/login';
  };

  // Method to load avatar for navbar
  const loadUserAvatar = useCallback(async () => {
    // Only load avatar if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("⚠️ Cannot load avatar: User not authenticated");
      return;
    }

    if (user && !user.avatar) {
      try {
        console.log("🖼️ Fetching user profile for avatar...");
        const profileData = await profileService.getProfile();
        if (profileData) {
          const updatedUser = { ...user, avatar: profileData.avata || profileData.avatar || null };
          setUser(updatedUser);
          console.log("✅ Updated user avatar:", updatedUser.avatar);
        } else {
          console.log("ℹ️ No profile data available - user may need to create profile");
        }
      } catch (err) {
        console.log("⚠️ Could not load avatar for navbar:", err.message);
      }
    } else if (user?.avatar) {
      console.log("ℹ️ Avatar already loaded:", user.avatar);
    }
  }, [user, isAuthenticated]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    refreshUserInfo, // Export this for manual refresh if needed
    loadUserAvatar, // Export this to load avatar when needed
    role: user?.role || null,
  };
}
