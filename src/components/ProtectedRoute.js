// src/components/ProtectedRoute.js - Component to protect routes that require authentication

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (requiredRole) {
        // Support multiple roles: requiredRole can be a string or array
        const userRole = user?.role;
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        
        console.log("🛡️ ProtectedRoute: Checking authorization...");
        console.log("   - User Role:", userRole, `(Type: ${typeof userRole})`);
        console.log("   - Required Role:", requiredRole);
        console.log("   - Allowed Roles:", allowedRoles);
        console.log("   - User Object:", user);
        console.log("   - Role Match Check:", allowedRoles.includes(userRole));

        if (!allowedRoles.includes(userRole)) {
          console.warn("🚫 Access Denied: User role is not in the allowed list.");
          console.warn("   - Role comparison failed:", {
            userRole,
            allowedRoles,
            includes: allowedRoles.includes(userRole)
          });
          router.push("/not-authorized"); // Redirect to not-authorized page
          return;
        }
        console.log("✅ Access Granted: User has the required role.");
      }

      setShouldRender(true);
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
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
