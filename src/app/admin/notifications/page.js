"use client";

import { useState, useEffect } from "react";
import notificationService from "@/services/notificationService";

export default function AdminNotificationsPage() {
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
      0: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      2: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      3: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      System: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Promotion: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Warning: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      OwnerRegister: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🔔 Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Mark All as Read
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium">
            Settings
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm">User Activity</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'user').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm">Payments</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'payment').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm">System</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'system').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-orange-100 text-sm">Reviews</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'review').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm">Alerts</p>
          <p className="text-3xl font-bold mt-2">
            {notifications.filter(n => n.type === 'alert').length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => {
            const color = getNotificationColor(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className={`text-4xl mr-4`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                        View Details
                      </button>
                      {!notification.read && (
                        <button className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 font-medium">
                          Mark as Read
                        </button>
                      )}
                      <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No More Notifications */}
      {notifications.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔕</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Notifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You're all caught up! Check back later for new notifications.
          </p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { label: 'User Registrations', enabled: true },
            { label: 'Payment Notifications', enabled: true },
            { label: 'System Updates', enabled: false },
            { label: 'Review Notifications', enabled: true },
            { label: 'Security Alerts', enabled: true },
            { label: 'Email Notifications', enabled: false }
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-900 dark:text-white font-medium">
                {pref.label}
              </span>
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
