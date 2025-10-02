import api from "@/utils/api";

const contractService = {
  create: async (data) => {
    console.log("🔗 CONTRACT SERVICE - Creating contract with data:", data);
    console.log("🔗 CONTRACT SERVICE - Data JSON:", JSON.stringify(data, null, 2));
    try {
      const response = await api.post('/api/Contract', data);
      console.log("✅ CONTRACT SERVICE - Contract created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ CONTRACT SERVICE - Error creating contract:", error);
      console.error("❌ CONTRACT SERVICE - Error response:", error.response);
      throw error;
    }
  },
  
  getAll: async () => {
    const response = await api.get('/api/Contract');
    return response;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/Contract/${id}`);
    return response;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/api/Contract/${id}`, data);
    return response;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/api/Contract/${id}`);
    return response;
  },

  getByOwnerId: async () => {
    try {
      const response = await api.get('/api/Contract/ByOwnerId');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching contracts by owner:', error);
      // Return empty array if endpoint doesn't exist yet
      return [];
    }
  },

  getByRoomId: async (roomId) => {
    try {
      const response = await api.get(`/api/Contract/room/${roomId}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching contracts by room:', error);
      return [];
    }
  },

  // Contract status management
  updateStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/Contract/${id}/status`, { contractStatus: status });
      return response.data || response;
    } catch (error) {
      console.error('Error updating contract status:', error);
      throw error;
    }
  },

  // Get contracts by tenant
  getByTenantId: async (tenantId) => {
    try {
      const response = await api.get(`/api/Contract/MyContract`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching contracts by tenant:', error);
      return [];
    }
  },

  // Extend contract
  extend: async (id, newCheckoutDate, notes = null) => {
    try {
      const response = await api.put(`/api/Contract/${id}/extendcontract`, { 
        CheckoutDate: newCheckoutDate,
        Notes: notes 
      });
      return response.data || response;
    } catch (error) {
      console.error('Error extending contract:', error);
      throw error;
    }
  },

  // Terminate contract (Cancel contract)
  terminate: async (id, reason) => {
    try {
      // Backend expects string in body, not object
      const response = await api.put(`/api/Contract/${id}/cancelcontract`, `"${reason}"`);
      return response.data || response;
    } catch (error) {
      console.error('Error cancelling contract:', error);
      throw error;
    }
  },

  // Add dependent (Identity Profile) to contract
  addDependent: async (contractId, dependentData) => {
    try {
      const response = await api.post(`/api/IdentityProfile/${contractId}`, dependentData);
      return response.data || response;
    } catch (error) {
      console.error('Error adding dependent:', error);
      throw error;
    }
  }
};

export default contractService;
