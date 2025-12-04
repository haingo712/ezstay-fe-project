import api from "@/utils/api";

/**
 * User Management Service
 * Handles user and staff account management operations
 */
class UserManagementService {
  constructor() {
    this.accountApiUrl = "/api/Accounts"; // Use Accounts endpoint
    this.authApiUrl = "/api/Auth";
  }

  /**
   * Get all accounts (Admin/Staff only)
   * @returns {Promise<Array>} List of all user accounts
   */
  async getAllAccounts() {
    try {
      const response = await api.get(this.accountApiUrl);
      console.log("✅ Fetched all accounts from Accounts:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching accounts:", error);
      throw error;
    }
  }

  /**
   * Get account by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User account details
   */
  async getAccountById(userId) {
    try {
      const response = await api.get(`${this.accountApiUrl}/${userId}`);
      console.log(`✅ Fetched account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get accounts by role
   * @param {number} roleId - Role ID (1=User, 2=Owner, 3=Staff, 4=Admin)
   * @returns {Promise<Array>} List of accounts with specified role
   */
  async getAccountsByRole(roleId) {
    try {
      // Get all accounts and filter by role since backend doesn't have /role endpoint
      const allAccounts = await this.getAllAccounts();
      const filtered = allAccounts.filter(acc => acc.role === roleId);
      console.log(`✅ Fetched ${filtered.length} accounts with role ${roleId}`);
      return filtered;
    } catch (error) {
      console.error(`❌ Error fetching accounts by role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Update account status (active/inactive) using ban/unban
   * @param {string} userId - User ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Update result
   */
  async updateAccountStatus(userId, isActive) {
    try {
      // Backend uses ban/unban instead of status endpoint
      // isActive = true means unban, isActive = false means ban
      const endpoint = isActive ? 'unban' : 'ban';
      const response = await api.patch(`${this.accountApiUrl}/${userId}/${endpoint}`);
      console.log(`✅ Updated account ${userId} status (${endpoint}):`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating account ${userId} status:`, error);
      throw error;
    }
  }

  /**
   * Create staff account (Admin only)
   * @param {Object} staffData - Staff account data
   * @returns {Promise<Object>} Created staff account
   */
  async createStaffAccount(staffData) {
    try {
      const response = await api.post(`${this.authApiUrl}/create-staff`, {
        FullName: staffData.fullName,
        Email: staffData.email,
        Phone: staffData.phone,
        Password: staffData.password,
      });
      console.log("✅ Created staff account:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating staff account:", error);
      throw error;
    }
  }

  /**
   * Delete account (Admin only)
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteAccount(userId) {
    try {
      const response = await api.delete(`${this.accountApiUrl}/${userId}`);
      console.log(`✅ Deleted account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Search accounts by keyword
   * @param {string} keyword - Search keyword
   * @returns {Promise<Array>} Matching accounts
   */
  async searchAccounts(keyword) {
    try {
      const response = await api.get(`${this.accountApiUrl}/search?keyword=${encodeURIComponent(keyword)}`);
      console.log("✅ Search results:", response);
      return response;
    } catch (error) {
      console.error("❌ Error searching accounts:", error);
      throw error;
    }
  }

  /**
   * Update account details (Admin/Staff only)
   * @param {string} userId - User ID
   * @param {Object} accountData - Updated account data
   * @returns {Promise<Object>} Update result
   */
  async updateAccount(userId, accountData) {
    try {
      const payload = {
        FullName: accountData.fullName,
        Email: accountData.email,
        Phone: accountData.phone,
        Password: accountData.password,
        Role: accountData.roleId,
      };

      console.log(`🔄 Updating account ${userId} with payload:`, payload);
      console.log(`🔄 URL: /api/Accounts/${userId}`);

      const response = await api.put(`/api/Accounts/${userId}`, payload);
      console.log(`✅ Updated account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating account ${userId}:`, error);
      console.error(`❌ Error details:`, error.response?.data);
      throw error;
    }
  }

  /**
   * Ban account (Admin/Staff only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Ban result
   */
  async banAccount(userId) {
    try {
      const response = await api.patch(`/api/Accounts/${userId}/ban`);
      console.log(`✅ Banned account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error banning account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Unban account (Admin/Staff only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Unban result
   */
  async unbanAccount(userId) {
    try {
      const response = await api.patch(`/api/Accounts/${userId}/unban`);
      console.log(`✅ Unbanned account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error unbanning account ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get pending owner requests (Staff only)
   * @returns {Promise<Array>} List of owner requests
   */
  async getOwnerRequests() {
    try {
      const response = await api.get(`/api/OwnerRequest`);
      console.log(`✅ Fetched owner requests:`, response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      // If 404 (no requests) return empty array to simplify frontend handling
      if (error?.response?.status === 404) {
        return [];
      }
      console.error('❌ Error fetching owner requests:', error);
      throw error;
    }
  }

  /**
   * Approve an owner request (Staff only)
   * @param {string} requestId - Request ID (GUID)
   * @returns {Promise<Object>} Approved request result
   */
  async approveOwnerRequest(requestId) {
    try {
      const response = await api.put(`/api/OwnerRequest/approve/${requestId}`);
      console.log(`✅ Approved owner request ${requestId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error approving owner request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Reject an owner request (Staff only)
   * @param {string} requestId - Request ID (GUID)
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Reject result
   */
  async rejectOwnerRequest(requestId, reason) {
    try {
      const payload = { RejectionReason: reason };
      const response = await api.put(`/api/OwnerRequest/reject/${requestId}`, payload);
      console.log(`✅ Rejected owner request ${requestId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error rejecting owner request ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Get role name from role ID
   * @param {number} roleId - Role ID
   * @returns {string} Role name
   */
  getRoleName(roleId) {
    const roles = {
      1: "User",
      2: "Owner",
      3: "Staff",
      4: "Admin"
    };
    return roles[roleId] || "Unknown";
  }

  /**
   * Get role badge color
   * @param {number} roleId - Role ID
   * @returns {string} Tailwind color class
   */
  getRoleBadgeColor(roleId) {
    const colors = {
      1: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      2: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      3: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      4: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[roleId] || "bg-gray-100 text-gray-800";
  }
}

export default new UserManagementService();
