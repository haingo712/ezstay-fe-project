// src/components/ProtectedRoute.js - Component to protect routes that require authentication

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure auth state is fully settled
      const delayedCheck = setTimeout(() => {
        console.log("🛡️ ProtectedRoute: Starting delayed authorization check...");
        console.log("   - Is Authenticated:", isAuthenticated);
        console.log("   - User:", user);
        console.log("   - Loading:", loading);

        // Additional check: Verify token exists and is valid
        const currentToken = localStorage.getItem("authToken");
        if (!currentToken) {
          console.log("❌ No token found in localStorage, redirecting to login");
          router.push("/login");
          setIsChecking(false);
          return;
        }

        if (!isAuthenticated || !user) {
          console.log("❌ Not authenticated or no user, redirecting to login");
          router.push("/login");
          setIsChecking(false);
          return;
        }

        // Verify user object has valid role
        if (!user.role) {
          console.warn("⚠️ User object missing role, clearing auth and redirecting");
          localStorage.clear();
          router.push("/login");
          setIsChecking(false);
          return;
        }

        if (requiredRole && user) {
          // Support multiple roles: requiredRole can be a string or array
          const userRole = user?.role;
          const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
          
          console.log("🛡️ ProtectedRoute: Checking authorization...");
          console.log("   - User Role:", userRole, `(Type: ${typeof userRole})`);
          console.log("   - Required Role:", requiredRole);
          console.log("   - Allowed Roles:", allowedRoles);
          console.log("   - User Object:", user);
          console.log("   - Current localStorage token:", localStorage.getItem("authToken")?.substring(0, 20) + "...");
          console.log("   - Role Match Check:", allowedRoles.includes(userRole));

          if (!allowedRoles.includes(userRole)) {
            console.warn("🚫 Access Denied: User role is not in the allowed list.");
            console.warn("   - Role comparison failed:", {
              userRole,
              allowedRoles,
              includes: allowedRoles.includes(userRole),
              userEmail: user?.email,
              currentTime: new Date().toISOString()
            });
            
            // Log localStorage contents for debugging
            console.warn("   - localStorage contents:", {
              authToken: !!localStorage.getItem("authToken"),
              userEmail: localStorage.getItem("userEmail"),
              allKeys: Object.keys(localStorage)
            });
            
            router.push("/not-authorized");
            setIsChecking(false);
            return;
          }
          console.log("✅ Access Granted: User has the required role.");
        }

        console.log("✅ ProtectedRoute: Authorization successful, rendering content");
        setShouldRender(true);
        setIsChecking(false);
      }, 200); // Increased delay to 200ms

      return () => clearTimeout(delayedCheck);
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  // Show loading spinner while checking authentication
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {loading ? "Loading..." : "Checking permissions..."}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children until authentication is verified
  if (!shouldRender) {
    return null;
  }

  return children;
}
