// src/components/RoleRedirect.js - Component to redirect based on user role

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RoleRedirect({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Add small delay to prevent race conditions during logout
    const delayedCheck = setTimeout(() => {
      if (!loading && !isRedirecting) {
        // If user is not authenticated, don't redirect (they should go to login)
        if (!isAuthenticated || !user) {
          return;
        }
        
        const userRole = user.role;
        
        console.log("🔄 RoleRedirect: Checking role-based access...");
        console.log("   - Current Path:", pathname);
        console.log("   - User Role:", userRole, `(Type: ${typeof userRole})`);
        console.log("   - Is Authenticated:", isAuthenticated);
        console.log("   - User Object:", user);

        // Don't redirect if user is on login page or public pages
        if (pathname === '/login' || pathname === '/' || pathname === '/register' || pathname.startsWith('/not-authorized')) {
          return;
        }

        // If user is owner (role 2), only allow access to owner pages
        if (userRole === 2) {
          if (!pathname.startsWith('/owner')) {
            console.log("🚫 Owner user trying to access non-owner page, redirecting...");
            setIsRedirecting(true);
            router.push('/owner/utility-rate');
            return;
          }
        }

        // If user is staff (role 3), only allow access to staff pages
        if (userRole === 3) {
          if (!pathname.startsWith('/staff')) {
            console.log("🚫 Staff user trying to access non-staff page, redirecting...");
            setIsRedirecting(true);
            router.push('/staff/users');
            return;
          }
        }
        
        // If user is admin (role 4), only allow access to admin pages  
        if (userRole === 4) {
          if (!pathname.startsWith('/admin')) {
            console.log("🚫 Admin user trying to access non-admin page, redirecting...");
            setIsRedirecting(true);
            router.push('/admin/dashboard');
            return;
          }
        }
      }
    }, 100); // Small delay to prevent race conditions

    return () => clearTimeout(delayedCheck);
  }, [isAuthenticated, user, loading, pathname, router, isRedirecting]);

  // Reset redirecting state when pathname changes
  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  return children;
}
