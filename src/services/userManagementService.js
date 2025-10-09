import api from "@/utils/api";

/**
 * User Management Service
 * Handles user and staff account management operations
 */
class UserManagementService {
  constructor() {
    this.accountApiUrl = "/api/TestAccount"; // Use TestAccount endpoint
    this.authApiUrl = "/api/Auth";
  }

  /**
   * Get all accounts (Admin/Staff only)
   * @returns {Promise<Array>} List of all user accounts
   */
  async getAllAccounts() {
    try {
      const response = await api.get(this.accountApiUrl);
      console.log("✅ Fetched all accounts from TestAccount:", response);
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
   * Update account status (active/inactive)
   * @param {string} userId - User ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Update result
   */
  async updateAccountStatus(userId, isActive) {
    try {
      const response = await api.put(`${this.accountApiUrl}/${userId}/status`, {
        isActive: isActive
      });
      console.log(`✅ Updated account ${userId} status:`, response);
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
      console.log(`🔄 URL: /api/TestAccount/${userId}`);
      
      const response = await api.put(`/api/TestAccount/${userId}`, payload);
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
      const response = await api.patch(`/api/TestAccount/${userId}/ban`);
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
      const response = await api.patch(`/api/TestAccount/${userId}/unban`);
      console.log(`✅ Unbanned account ${userId}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error unbanning account ${userId}:`, error);
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
