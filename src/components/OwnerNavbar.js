"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/context/LanguageContext";
import { apiFetch } from "@/utils/api";

// Chuông thông báo cho Owner
function OwnerNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  async function markNotificationAsRead(id) {
    try {
      await apiFetch(`/api/Notification/mark-read/${id}`, { method: "PUT" });
    } catch { }
  }

  async function fetchNotifications() {
    try {
      const data = await apiFetch("/api/Notification/by-role");
      setNotifications(Array.isArray(data) ? data : []);
    } catch { }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showDropdown) fetchNotifications();
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-green-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setShowDropdown((v) => !v)}
        title="Xem thông báo"
      >
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.243a2 2 0 0 1-3.714 0M21 19H3m16-2V9a7 7 0 1 0-14 0v8a2 2 0 0 1-2 2h16a2 2 0 0 1-2-2Z" />
        </svg>
        {notifications.some(n => !n.isRead) && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
          <div className="font-bold mb-2 text-green-700">Thông báo</div>
          {notifications.length === 0 && <div className="text-gray-500 text-sm">Không có thông báo.</div>}
          <ul>
            {notifications.slice(0, 10).map(n => (
              <li
                key={n.id}
                className={`mb-2 p-2 rounded hover:bg-green-50 dark:hover:bg-gray-700 cursor-pointer` + (n.isRead ? '' : ' border-l-4 border-green-500')}
                onClick={async () => {
                  if (!n.isRead) {
                    await markNotificationAsRead(n.id);
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                  }
                }}
              >
                <div className="font-semibold text-green-700 dark:text-green-300 text-sm">{n.title}</div>
                <div className="text-gray-700 dark:text-gray-200 text-xs">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                {!n.isRead && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Mới</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function OwnerNavbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, user, logout, loadUserAvatar } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !user.avatar && !user.avata) {
      loadUserAvatar();
    }
  }, [isAuthenticated, user?.id]);

  const userEmail = user?.email ||
    user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
    user?.fullName ||
    "Owner";

  const userAvatar = user?.avatar || user?.avata || null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/owner" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              EZStay Owner
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <OwnerNotificationBell />

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-1"
                title="Change Language"
              >
                <span className="text-sm font-medium">{language === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
                <span className="text-xs">{language === 'vi' ? 'VI' : 'EN'}</span>
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => { changeLanguage('vi'); setIsLanguageMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${language === 'vi' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    <span>🇻🇳</span><span>Tiếng Việt</span>
                  </button>
                  <button
                    onClick={() => { changeLanguage('en'); setIsLanguageMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${language === 'en' ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    <span>🇺🇸</span><span>English</span>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 overflow-hidden"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span>${userEmail.charAt(0).toUpperCase()}</span>`; }} />
                ) : (
                  <span>{userEmail.charAt(0).toUpperCase()}</span>
                )}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 w-56 py-2 mt-2 bg-white rounded-md shadow-xl dark:bg-gray-800 z-20">
                  <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                    <p className="font-semibold truncate">{userEmail}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Owner</p>
                  </div>
                  <Link href="/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsUserMenuOpen(false)}>
                    {t('nav.profile') || 'Hồ sơ'}
                  </Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    {t('nav.logout') || 'Đăng xuất'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
