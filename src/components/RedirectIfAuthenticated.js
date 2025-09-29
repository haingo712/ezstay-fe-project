// src/components/RedirectIfAuthenticated.js
// Component để redirect authenticated users khỏi login/register pages

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 RedirectIfAuthenticated useEffect triggered:");
    console.log("   - loading:", loading);
    console.log("   - isAuthenticated:", isAuthenticated);
    console.log("   - user:", user);
    
    if (!loading && isAuthenticated && user) {
      console.log("🔄 RedirectIfAuthenticated: User already authenticated, redirecting...");
      console.log("   - User:", user.email);
      console.log("   - Role:", user.role);
      
      // Redirect based on user role (using numeric role values)
      // Role values: Owner = 2, Staff = 3, Admin = 4, User = other values
      const userRole = user.role;
      
      console.log("   - User role value:", userRole, `(Type: ${typeof userRole})`);
      
      if (userRole === 2) { // Owner
        console.log("✅ Redirecting Owner to owner dashboard...");
        router.push("/owner");
      } else if (userRole === 3) { // Staff
        console.log("✅ Redirecting Staff to staff page...");
        router.push("/staff");
      } else if (userRole === 4) { // Admin
        console.log("✅ Redirecting Admin to admin page...");
        router.push("/admin");
      } else {
        console.log("✅ Redirecting User to homepage...");
        router.push("/");
      }
    } else {
      console.log("🔍 RedirectIfAuthenticated: Not redirecting because:");
      console.log("   - loading:", loading);
      console.log("   - isAuthenticated:", isAuthenticated);
      console.log("   - user exists:", !!user);
    }
  }, [isAuthenticated, user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render the children (login/register form)
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Only render children (login/register form) if user is not authenticated
  return children;
}