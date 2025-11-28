"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";
// Chuông thông báo dùng cho mọi user
function GlobalNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  
  // Đánh dấu đã đọc notification
  async function markNotificationAsRead(id) {
    try {
      await apiFetch(`/api/Notification/mark-read/${id}`, { method: "PUT" });
    } catch { }
  }
  
  // Fetch notifications function
  async function fetchNotifications() {
    try {
      const data = await apiFetch("/api/Notification/by-role");
      setNotifications(Array.isArray(data) ? data : []);
    } catch { }
  }
  
  // Fetch ngay khi component mount và tự động refresh mỗi 30 giây
  useEffect(() => {
    fetchNotifications(); // Fetch ngay lần đầu
    const interval = setInterval(fetchNotifications, 30000); // Refresh mỗi 30s
    return () => clearInterval(interval); // Cleanup
  }, []);
  
  // Refetch khi mở dropdown để có data mới nhất
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setShowDropdown((v) => !v)}
        title="Xem thông báo"
      >
        <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.243a2 2 0 0 1-3.714 0M21 19H3m16-2V9a7 7 0 1 0-14 0v8a2 2 0 0 1-2 2h16a2 2 0 0 1-2-2Z" />
        </svg>
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
          <div className="font-bold mb-2 text-blue-700">Thông báo mới</div>
          {notifications.length === 0 && <div className="text-gray-500 text-sm">Không có thông báo.</div>}
          <ul>
            {notifications.slice(0, 10).map(n => (
              <li
                key={n.id}
                className={
                  `mb-2 p-2 rounded hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer` +
                  (n.isRead ? '' : ' border-l-4 border-blue-500')
                }
                onClick={async () => {
                  if (!n.isRead) {
                    await markNotificationAsRead(n.id);
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                  }
                }}
              >
                <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{n.title}</div>
                <div className="text-gray-700 dark:text-gray-200 text-xs">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                {!n.isRead && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mới</span>
                )}
              </li>
            ))}
          </ul>
          {/* Không có nút Xem tất cả */}
        </div>
      )}
    </div>
  );
}
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, user, logout, refreshUserInfo, loadUserAvatar } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Load user avatar when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("📸 Navbar: User authenticated, checking avatar...");
      if (!user.avatar && !user.avata) {
        console.log("📸 Navbar: No avatar found, loading...");
        loadUserAvatar();
      } else {
        console.log("📸 Navbar: Avatar already present:", user.avatar || user.avata);
      }
    }
  }, [isAuthenticated, user?.id]); // Only re-run when authentication status or user ID changes

  // Get user role from user object or default to guest
  const userRole = user?.role || "guest";

  // Get email from various possible JWT claim locations
  const userEmail = user?.email ||
    user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    user?.fullName ||
    user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
    "Guest User";

  // Get avatar URL from user object (note: backend uses 'avata' not 'avatar')
  const userAvatar = user?.avatar || user?.avata || null;

  // Debug logging
  console.log("Navbar - User:", user);
  console.log("Navbar - UserRole:", userRole, "Type:", typeof userRole);
  console.log("Navbar - UserEmail:", userEmail);
  console.log("Navbar - UserAvatar:", userAvatar);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    console.log("🚪 Logout initiated from Navbar");
    logout();
    setIsUserMenuOpen(false);
    // Redirect to home page after logout
    router.push("/");
  };

  const getNavigationItems = () => {
    const baseItems = [
      { href: "/", label: t('nav.home') },
      { href: "/rental-posts", label: t('nav.rentalPost') },
      { href: "/support", label: t('nav.support') },
      { href: "/about", label: t('nav.about') },
    ];

    if (isAuthenticated) {
      baseItems.splice(2, 0, { href: "/favorites", label: "Favorites" });
    }

    return baseItems;
  };

  const getUserDashboardLink = () => {
    switch (userRole) {
      case 4:
      case "admin":
        return "/admin";
      case 3:
      case "staff":
        return "/staff";
      case 2:
      case "owner":
        return "/owner";
      case 1:
      case "user":
        return "/dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                EZStay
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Chuông thông báo */}
              <GlobalNotificationBell />
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Language Toggle Button */}
              <button
                onClick={() => changeLanguage(language === 'en' ? 'vi' : 'en')}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold text-sm"
                title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
              >
                {language === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
              </button>

              {/* Authentication Actions */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden"
                  >
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // On error, hide image and show letter
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span>${userEmail.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <span>{userEmail.charAt(0).toUpperCase()}</span>
                    )}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 w-56 py-2 mt-2 bg-white rounded-md shadow-xl dark:bg-gray-800 z-20">
                      <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                        <p className="font-semibold truncate">{userEmail}</p>
                      </div>
                      
                      {/* Hồ sơ - Hiện cho tất cả roles */}
                      <Link
                        href="/profile"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('nav.profile')}
                      </Link>

                      {/* Tin nhắn - Chỉ cho User và Owner */}
                      {(userRole === 1 || userRole === "user" || userRole === 2 || userRole === "owner") && (
                        <Link
                          href="/chat"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('nav.myChats')}
                        </Link>
                      )}

                      {/* Lịch sử thuê - Chỉ cho User */}
                      {(userRole === 1 || userRole === "user") && (
                        <Link
                          href="/profile/rental-history"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('nav.rentalHistory')}
                        </Link>
                      )}

                      {/* Hóa đơn - Chỉ cho User và Owner */}
                      {(userRole === 1 || userRole === "user" || userRole === 2 || userRole === "owner") && (
                        <Link
                          href="/bills"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('nav.myBills')}
                        </Link>
                      )}

                      {/* Bảng điều khiển - Chỉ cho Owner, Staff, Admin */}
                      {(userRole === 2 || userRole === "owner" || userRole === 3 || userRole === "staff" || userRole === 4 || userRole === "admin") && (
                        <Link
                          href={getUserDashboardLink()}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {t('nav.dashboard')}
                        </Link>
                      )}

                      {/* Register as Owner - Chỉ cho User */}
                      {(userRole === 1 || userRole === "user") && (
                        <Link
                          href="/register-owner"
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          🏠 Register as Owner
                        </Link>
                      )}

                      {/* Đăng xuất - Hiện cho tất cả roles */}
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Language Toggle for Mobile */}
              <button
                onClick={() => changeLanguage(language === 'en' ? 'vi' : 'en')}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 font-medium"
              >
                {language === 'en' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
              </button>

              {!isAuthenticated && (
                <div className="pt-2 space-y-2">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
