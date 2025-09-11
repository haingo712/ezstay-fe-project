// src/components/RoleRedirect.js - Component to redirect based on user role

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RoleRedirect({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Memoize the access check function to prevent useEffect dependency issues
  const isValidAccess = useCallback(() => {
    if (!isAuthenticated || !user || loading) return true; // Still loading or not authenticated
    
    const userRole = user.role;
    if (!userRole) return true; // Role not loaded yet
    
    // Public pages that everyone can access during auth flow
    if (pathname === '/login' || pathname === '/register') return true;
    
    // Check role-based access
    if (userRole === 2 && !pathname.startsWith('/owner')) return false; // Owner trying non-owner page
    if (userRole === 3 && !pathname.startsWith('/staff')) return false; // Staff trying non-staff page  
    if (userRole === 4 && !pathname.startsWith('/admin')) return false; // Admin trying non-admin page
    
    return true; // Valid access
  }, [isAuthenticated, user, loading, pathname]);

  useEffect(() => {
    if (!loading && !isRedirecting) {
      // If user is not authenticated, don't redirect (they should go to login)
      if (!isAuthenticated || !user) {
        console.log("🔄 RoleRedirect: User not authenticated, skipping redirect");
        return;
      }
      
      const userRole = user.role;
      
      console.log("🔄 RoleRedirect: Checking role-based access...");
      console.log("   - Current Path:", pathname);
      console.log("   - User Role:", userRole, `(Type: ${typeof userRole})`);
      console.log("   - Is Authenticated:", isAuthenticated);
      console.log("   - User Object:", user);

      // Don't redirect if user is on login page or register page (public access needed)
      if (pathname === '/login' || pathname === '/register') {
        console.log("🔄 RoleRedirect: On auth page, no redirect needed");
        return;
      }

      // If user role is not available yet, wait
      if (!userRole) {
        console.log("🔄 RoleRedirect: User role not yet available, waiting...");
        return;
      }

      // IMMEDIATE STRICT ROLE-BASED ACCESS CONTROL - NO DELAY
      
      // If user is Owner (role 2), ONLY allow access to owner pages
      if (userRole === 2) {
        if (!pathname.startsWith('/owner')) {
          console.log("🚫 Owner user trying to access non-owner page, redirecting to owner dashboard...");
          setIsRedirecting(true);
          router.push('/owner/boarding-houses');
          return;
        }
      }

      // If user is Staff (role 3), ONLY allow access to staff pages
      else if (userRole === 3) {
        if (!pathname.startsWith('/staff')) {
          console.log("🚫 Staff user trying to access non-staff page, redirecting to staff dashboard...");
          setIsRedirecting(true);
          router.push('/staff/users');
          return;
        }
      }
      
      // If user is Admin (role 4), ONLY allow access to admin pages  
      else if (userRole === 4) {
        if (!pathname.startsWith('/admin')) {
          console.log("🚫 Admin user trying to access non-admin page, redirecting to admin dashboard...");
          setIsRedirecting(true);
          router.push('/admin/dashboard');
          return;
        }
      }
      
      // If user has regular role (1) or unknown role, allow home and public pages only
      else {
        // Allow regular users to access public pages but not admin/staff/owner areas
        if (pathname.startsWith('/owner') || pathname.startsWith('/staff') || pathname.startsWith('/admin')) {
          console.log("🚫 Regular user trying to access protected area, redirecting to home...");
          setIsRedirecting(true);
          router.push('/');
          return;
        }
      }

      console.log("✅ RoleRedirect: User is on correct page for their role");
    }
  }, [isAuthenticated, user, loading, pathname, router, isRedirecting]);

  // Reset redirecting state when pathname changes and check access
  useEffect(() => {
    setIsRedirecting(false);
    setShouldRender(isValidAccess());
  }, [isValidAccess]);

  // Don't render if user shouldn't have access to prevent flash
  if (!shouldRender && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return children;
}
