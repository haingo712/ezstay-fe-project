"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import notificationService from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("🔔 NotificationBell: Fetching notifications...");
      const data = await notificationService.getAllNotifications();
      console.log("🔔 NotificationBell: Data received:", data);
      
      if (Array.isArray(data)) {
        // Only keep unread notifications for the bell
        const unread = data.filter((n) => !n.isRead);
        console.log(`🔔 NotificationBell: Found ${unread.length} unread notifications`);
        // Sort by createdAt and take only latest 5
        const sorted = unread.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setNotifications(sorted);
      } else {
        console.warn("🔔 NotificationBell: Data is not an array, setting empty");
        setNotifications([]);
      }
    } catch (err) {
      console.error("🔔 NotificationBell: Failed to fetch notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      // Remove from local state
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const unreadCount = notifications.length;

  const getNotificationLink = () => {
    if (!user) return "/";
    const roleId = user.roleId || user.role;
    
    switch (roleId) {
      case 4: return "/admin/notifications";
      case 3: return "/staff/notifications";
      case 2: return "/owner/notifications";
      default: return "/profile"; // User doesn't have notification page yet
    }
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      0: "bg-blue-100 text-blue-800",
      1: "bg-green-100 text-green-800",
      2: "bg-red-100 text-red-800",
      3: "bg-purple-100 text-purple-800",
      System: "bg-blue-100 text-blue-800",
      Promotion: "bg-green-100 text-green-800",
      Warning: "bg-red-100 text-red-800",
      OwnerRegister: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getNotificationTypeLabel = (type) => {
    const types = {
      0: "System",
      1: "Promotion",
      2: "Warning",
      3: "Owner Register",
      System: "System",
      Promotion: "Promotion",
      Warning: "Warning",
      OwnerRegister: "Owner Register",
    };
    return types[type] || type;
  };

  // Don't show for guests
  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <Link
                href={getNotificationLink()}
                onClick={() => setShowDropdown(false)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                View All
              </Link>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No new notifications
                  </p>
                </div>
              )}

              {!loading && notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink()}
                  onClick={() => {
                    setShowDropdown(false);
                  }}
                  className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getNotificationTypeColor(
                            notification.notificationType
                          )}`}
                        >
                          {getNotificationTypeLabel(notification.notificationType)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex-shrink-0"
                      title="Mark as read"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <Link
                  href={getNotificationLink()}
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-center block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View All Notifications →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
