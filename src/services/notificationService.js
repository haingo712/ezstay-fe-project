import api from "@/utils/api";

/**
 * Notification Service for managing notifications
 * Endpoints from NotificationAPI backend
 */

class NotificationService {
  /**
   * Get all notifications for current user/role
   * @returns {Promise<Array>} List of notifications
   */
  async getAllNotifications() {
    try {
      console.log("🔍 Fetching notifications from API...");
      const response = await api.get("/api/Notification/all-by-role");
      console.log("✅ API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📊 Response status:", response.status);
      
      // Handle different response formats
      if (response.data === undefined || response.data === null) {
        console.warn("⚠️ API returned undefined/null data, returning empty array");
        return [];
      }
      
      // If response.data is already an array, return it
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If response.data has a nested data or items property
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      }
      
      // If we get here, data format is unexpected
      console.warn("⚠️ Unexpected data format:", typeof response.data, response.data);
      return [];
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  /**
   * Get notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Notification details
   */
  async getNotificationById(id) {
    try {
      const response = await api.get(`/api/Notification/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notification:", error);
      throw error;
    }
  }

  /**
   * Create a new notification (Admin/Staff only)
   * @param {Object} notificationData - { notificationType, title, message }
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const response = await api.post("/api/Notification", notificationData);
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create notification by role (send to all users with specific role)
   * @param {Object} data - { notificationType, title, message, targetRole, scheduledTime? }
   * @returns {Promise<Object>} Created notification
   */
  async createNotificationByRole(data) {
    try {
      const response = await api.post("/api/Notification/by-role", data);
      return response.data;
    } catch (error) {
      console.error("Error creating notification by role:", error);
      throw error;
    }
  }

  /**
   * Update notification
   * @param {string} id - Notification ID
   * @param {Object} notificationData - { notificationType, title, message }
   * @returns {Promise<Object>} Updated notification
   */
  async updateNotification(id, notificationData) {
    try {
      const response = await api.put(`/api/Notification/${id}`, notificationData);
      return response.data;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(id) {
    try {
      await api.delete(`/api/Notification/${id}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<string>} Success message
   */
  async markAsRead(id) {
    try {
      const response = await api.put(`/api/Notification/mark-read/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Get all notification types
   * @returns {Promise<Array>} List of notification types
   */
  async getNotificationTypes() {
    try {
      console.log("🔍 Fetching notification types...");
      const response = await api.get("/api/Notification/types");
      console.log("✅ Notification types response:", response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return default types if API fails
      return [
        { value: 0, label: "System" },
        { value: 1, label: "Promotion" },
        { value: 2, label: "Warning" },
        { value: 3, label: "Owner Register" }
      ];
    } catch (error) {
      console.error("❌ Error fetching notification types:", error);
      // Return default types instead of throwing
      return [
        { value: 0, label: "System" },
        { value: 1, label: "Promotion" },
        { value: 2, label: "Warning" },
        { value: 3, label: "Owner Register" }
      ];
    }
  }

  /**
   * Get all roles (for admin/staff to send notifications by role)
   * @returns {Promise<Array>} List of roles
   */
  async getAllRoles() {
    try {
      console.log("🔍 Fetching roles...");
      const response = await api.get("/api/Notification/roles");
      console.log("✅ Roles response:", response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Return default roles if API fails
      return [
        { value: 1, label: "User" },
        { value: 2, label: "Owner" },
        { value: 3, label: "Staff" },
        { value: 4, label: "Admin" }
      ];
    } catch (error) {
      console.error("❌ Error fetching roles:", error);
      // Return default roles instead of throwing
      return [
        { value: 1, label: "User" },
        { value: 2, label: "Owner" },
        { value: 3, label: "Staff" },
        { value: 4, label: "Admin" }
      ];
    }
  }

  /**
   * Schedule notification (send at specific time)
   * @param {Object} data - { notificationType, title, message, targetRole, scheduledTime }
   * @returns {Promise<Object>} Scheduled notification
   */
  async scheduleNotification(data) {
    try {
      const response = await api.post("/api/Notification/schedule", data);
      return response.data;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }
}

export default new NotificationService();
