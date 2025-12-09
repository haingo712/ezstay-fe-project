import axiosInstance from '@/utils/axiosConfig';

/**
 * Owner Request Service
 * Handles owner registration requests for Staff
 */
export const ownerRequestService = {
  /**
   * Get all pending owner requests (Staff only)
   * @returns {Promise<Array>}
   */
  async getAllRequests() {
    try {
      console.log('📡 Fetching all owner requests...');
      
      const response = await axiosInstance.get('/api/OwnerRequest');
      
      console.log('✅ Owner requests fetched:', response.data);
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('💥 Error fetching owner requests:', error);
      throw error;
    }
  },

  /**
   * Approve owner request (Staff only)
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>}
   */
  async approveRequest(requestId) {
    try {
      console.log('✅ Approving request:', requestId);
      
      const response = await axiosInstance.put(`/api/OwnerRequest/approve/${requestId}`);
      
      console.log('✅ Request approved:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('💥 Error approving request:', error);
      throw error;
    }
  },

  /**
   * Reject owner request (Staff only)
   * @param {string} requestId - Request ID
   * @param {string} rejectionReason - Rejection reason
   * @returns {Promise<Object>}
   */
  async rejectRequest(requestId, rejectionReason) {
    try {
      console.log('❌ Rejecting request:', requestId);
      
      const response = await axiosInstance.put(
        `/api/OwnerRequest/reject/${requestId}`,
        { RejectionReason: rejectionReason }
      );
      
      console.log('✅ Request rejected:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('💥 Error rejecting request:', error);
      throw error;
    }
  },
};

export default ownerRequestService;
