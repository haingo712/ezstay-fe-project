// src/components/RoleBasedRedirect.js
// Component để enforce strict role-based routing

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RoleBasedRedirect({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Helper function to get role name for logging
  const getRoleName = (role) => {
    switch (role) {
      case 2: return 'Owner';
      case 3: return 'Staff';
      case 4: return 'Admin';
      default: return 'User';
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const userRole = user.role;
      
      console.log("🔄 RoleBasedRedirect: Checking route access...");
      console.log("   - Current path:", pathname);
      console.log("   - User role:", userRole, `(${getRoleName(userRole)})`);
      console.log("   - Role type:", typeof userRole);
      
      // Define role-specific allowed paths and redirect targets
      // Role values: User = undefined/null, Owner = 2, Staff = 3, Admin = 4
      const roleConfig = {
        2: { // Owner
          allowedPaths: ['/owner'],
          redirectTo: '/owner/boarding-houses',
          strictMode: true // Owner cannot access any other pages
        },
        3: { // Staff
          allowedPaths: ['/staff'],
          redirectTo: '/staff',
          strictMode: true // Staff cannot access any other pages
        },
        4: { // Admin
          allowedPaths: ['/admin'],
          redirectTo: '/admin',
          strictMode: true // Admin cannot access any other pages
        },
        'default': { // User (null, undefined, 1, or other values)
          allowedPaths: ['/'], // User can access homepage and other general pages
          redirectTo: '/',
          strictMode: false // User has more freedom
        }
      };

      const config = roleConfig[userRole] || roleConfig['default'];
      
      console.log("🔧 Using config for role:", userRole, "→", config);

      // Check if current path is allowed for this role
      const isPathAllowed = config.allowedPaths.some(allowedPath => {
        if (allowedPath === '/') {
          // For homepage, exact match
          return pathname === '/';
        } else {
          // For other paths, check if current path starts with allowed path
          return pathname.startsWith(allowedPath);
        }
      });

      // Special handling for strict mode roles
      if (config.strictMode && !isPathAllowed) {
        console.log(`🚫 Role ${userRole} (${getRoleName(userRole)}) trying to access unauthorized path: ${pathname}`);
        console.log(`✅ Redirecting Role ${userRole} to: ${config.redirectTo}`);
        router.push(config.redirectTo);
        return;
      }

      // For non-strict mode (User), allow access to general pages
      if (!config.strictMode) {
        // List of paths that Users can access
        const publicPaths = ['/', '/boarding-houses', '/rooms', '/search', '/search-rooms', '/support', '/about', '/profile'];
        const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
        
        // If User is trying to access admin/staff/owner areas, redirect to homepage
        if (pathname.startsWith('/admin') || pathname.startsWith('/staff') || pathname.startsWith('/owner')) {
          console.log(`🚫 User (role: ${userRole}) trying to access admin area: ${pathname}`);
          console.log(`✅ Redirecting User to homepage`);
          router.push('/');
          return;
        }
      }

      console.log(`✅ Role ${userRole} (${getRoleName(userRole)}) access granted for path: ${pathname}`);
    }
  }, [isAuthenticated, user, loading, pathname, router]);

  // Don't render anything during loading or redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  return children;
}