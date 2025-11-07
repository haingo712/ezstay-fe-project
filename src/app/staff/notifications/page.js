"use client";

import { useState, useEffect } from "react";
import notificationService from "@/services/notificationService";

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationTypes, setNotificationTypes] = useState([]);
  const [roles, setRoles] = useState([]);

  // Form state for creating notification
  const [formData, setFormData] = useState({
    notificationType: 0, // System
    title: "",
    message: "",
    targetRole: null, // null = individual, or role number for broadcast
    scheduledTime: "",
  });

  useEffect(() => {
    fetchNotifications();
    fetchNotificationTypes();
    fetchRoles();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      console.log("📬 Notification data received:", data);
      
      // Safely handle data - ensure it's an array
      if (Array.isArray(data)) {
        // Sort by createdAt (newest first)
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(sorted);
        setError(null);
      } else {
        console.warn("⚠️ Data is not an array:", data);
        setNotifications([]);
        setError(null); // No error, just empty list
      }
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationTypes = async () => {
    try {
      const types = await notificationService.getNotificationTypes();
      console.log("🔔 Notification types:", types);
      setNotificationTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error("❌ Failed to fetch notification types:", err);
      setNotificationTypes([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await notificationService.getAllRoles();
      console.log("👥 Roles data:", rolesData);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      console.error("❌ Failed to fetch roles:", err);
      setRoles([]);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      alert("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      if (selectedNotification?.id === id) {
        setShowDetailModal(false);
        setSelectedNotification(null);
      }
    } catch (err) {
      alert("Failed to delete notification");
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      if (formData.targetRole !== null) {
        // Create by role (broadcast)
        const payload = {
          notificationType: parseInt(formData.notificationType),
          title: formData.title,
          message: formData.message,
          targetRole: parseInt(formData.targetRole),
          scheduledTime: formData.scheduledTime || null,
        };
        
        if (formData.scheduledTime) {
          await notificationService.scheduleNotification(payload);
          alert("Notification scheduled successfully!");
        } else {
          await notificationService.createNotificationByRole(payload);
          alert("Notification sent to all users with the selected role!");
        }
      } else {
        // Create individual notification
        const payload = {
          notificationType: parseInt(formData.notificationType),
          title: formData.title,
          message: formData.message,
        };
        await notificationService.createNotification(payload);
        alert("Notification created successfully!");
      }

      setShowCreateModal(false);
      setFormData({
        notificationType: 0,
        title: "",
        message: "",
        targetRole: null,
        scheduledTime: "",
      });
      fetchNotifications();
    } catch (err) {
      alert("Failed to create notification. " + (err.response?.data?.message || err.message));
    }
  };

  const handleViewDetail = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "read") return n.isRead;
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const getRoleLabel = (roleNum) => {
    const roleMap = {
      1: "User",
      2: "Owner",
      3: "Staff",
      4: "Admin",
    };
    return roleMap[roleNum] || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view all notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {unreadCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {notifications.length - unreadCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {["all", "unread", "read"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  filter === tab
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab}
                {tab === "unread" && unreadCount > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-800 py-0.5 px-2 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications list */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {error && (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {!error && filteredNotifications.length === 0 && (
            <div className="p-12 text-center">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No notifications
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filter === "all"
                  ? "You don't have any notifications yet."
                  : `You don't have any ${filter} notifications.`}
              </p>
            </div>
          )}

          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                !notification.isRead ? "bg-blue-50 dark:bg-blue-900/10" : ""
              }`}
              onClick={() => handleViewDetail(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getNotificationTypeColor(
                        notification.notificationType
                      )}`}
                    >
                      {getNotificationTypeLabel(notification.notificationType)}
                    </span>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <svg
                        className="w-5 h-5"
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
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Notification
              </h2>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.notificationType}
                    onChange={(e) =>
                      setFormData({ ...formData, notificationType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value={0}>System</option>
                    <option value={1}>Promotion</option>
                    <option value={2}>Warning</option>
                    <option value={3}>Owner Register</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetRole === null ? "" : formData.targetRole}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetRole: e.target.value === "" ? null : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Individual (Current User)</option>
                    <option value={1}>All Users</option>
                    <option value={2}>All Owners</option>
                    <option value={3}>All Staff</option>
                    <option value={4}>All Admins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {formData.targetRole !== null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Schedule Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty to send immediately
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({
                        notificationType: 0,
                        title: "",
                        message: "",
                        targetRole: null,
                        scheduledTime: "",
                      });
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Detail
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium rounded ${getNotificationTypeColor(
                      selectedNotification.notificationType
                    )}`}
                  >
                    {getNotificationTypeLabel(selectedNotification.notificationType)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedNotification.title}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNotification.isRead ? "Read" : "Unread"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedNotification.targetRole && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Target Audience</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {getRoleLabel(selectedNotification.targetRole)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Notification ID</p>
                      <p className="font-medium text-gray-900 dark:text-white text-xs">
                        {selectedNotification.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  {!selectedNotification.isRead && (
                    <button
                      onClick={() => {
                        handleMarkAsRead(selectedNotification.id);
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDelete(selectedNotification.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
