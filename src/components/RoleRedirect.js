// src/components/RoleRedirect.js - Component to redirect based on user role

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RoleRedirect({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, don't redirect
      if (!isAuthenticated || !user) {
        return;
      }
      
      const userRole = user.role;
      
      console.log("🔄 RoleRedirect: Checking role-based access...");
      console.log("   - Current Path:", pathname);
      console.log("   - User Role:", userRole);

      // If user is staff (role 3), only allow access to staff pages
      if (userRole === 3) {
        if (!pathname.startsWith('/staff')) {
          console.log("🚫 Staff user trying to access non-staff page, redirecting...");
          router.push('/staff/users');
          return;
        }
      }
      
      // If user is admin (role 4), only allow access to admin pages  
      if (userRole === 4) {
        if (!pathname.startsWith('/admin')) {
          console.log("🚫 Admin user trying to access non-admin page, redirecting...");
          router.push('/admin/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, user, loading, pathname, router]);

  return children;
}
