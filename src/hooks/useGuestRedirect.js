// src/hooks/useGuestRedirect.js
// Hook để redirect guest đến trang login khi tương tác

"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useGuestRedirect() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Function để wrap onClick handler
  // Nếu chưa đăng nhập, redirect đến login thay vì thực hiện action
  const requireAuth = (callback, returnUrl = null) => {
    return (e) => {
      if (!isAuthenticated && !loading) {
        e?.preventDefault?.();
        // Lưu URL hiện tại để redirect sau khi login
        const currentPath = returnUrl || window.location.pathname;
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }
      // Nếu đã đăng nhập, thực hiện callback
      if (callback) {
        callback(e);
      }
    };
  };

  // Function để check trước khi navigate
  const navigateWithAuth = (url) => {
    if (!isAuthenticated && !loading) {
      router.push(`/login?returnUrl=${encodeURIComponent(url)}`);
      return false;
    }
    router.push(url);
    return true;
  };

  // Function để lấy href (dùng cho Link component)
  // Nếu guest thì return login URL, nếu authenticated thì return URL gốc
  const getAuthHref = (url) => {
    if (!isAuthenticated && !loading) {
      return `/login?returnUrl=${encodeURIComponent(url)}`;
    }
    return url;
  };

  return {
    isGuest: !isAuthenticated && !loading,
    isAuthenticated,
    loading,
    requireAuth,
    navigateWithAuth,
    getAuthHref,
  };
}

export default useGuestRedirect;
