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
      // Try ByOwnerId first (Owner role endpoint)
      console.log('📊 Fetching contracts for owner...');
      const response = await api.get('/api/Contract/all/owner?$count=false');
      console.log('📊 OData Response:', response);

      // OData returns data in { value: [...] } format
      if (response && response.value) {
        return response.value;
      }

      // Fallback to regular response
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Error fetching contracts by owner:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);

      // If ByOwnerId fails, try MyContract endpoint as fallback
      if (error.response?.status === 500 || error.response?.status === 400) {
        try {
          console.log('⚠️ Trying MyContract endpoint instead...');
          const retryResponse = await api.get('/api/Contract/my-contract?$count=false');
          if (retryResponse && retryResponse.value) {
            return retryResponse.value;
          }
          return retryResponse.data || retryResponse || [];
        } catch (retryError) {
          console.error('❌ MyContract also failed:', retryError);
        }
      }

      // Return empty array as last resort
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
      const response = await api.get(`/api/Contract/my-contract`);
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
      const response = await api.put(`/api/Contract/${id}/cancel`, `"${reason}"`);
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
  },

  // Get identity profiles for a contract
  getIdentityProfiles: async (contractId) => {
    try {
      console.log("🔍 Fetching identity profiles for contract:", contractId);
      const response = await api.get(`/api/IdentityProfile/contract/${contractId}`);
      console.log("✅ Identity profiles fetched:", response);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching identity profiles:', error);
      return [];
    }
  },

  // Upload contract images (scanned contract)
  uploadContractImages: async (contractId, files) => {
    try {
      const formData = new FormData();

      // Backend expects [FromForm] List<IFormFile> request
      files.forEach((file) => {
        formData.append('request', file);
      });

      console.log("📤 Uploading contract images:", {
        contractId,
        fileCount: files.length,
        fileNames: files.map(f => f.name)
      });

      // Use putFormData instead of put for FormData
      const response = await api.putFormData(`/api/Contract/${contractId}/upload-image`, formData);

      console.log("✅ Upload successful:", response);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error uploading contract images:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  // Delete contract image (if needed in future)
  deleteContractImage: async (contractId, imageUrl) => {
    try {
      const response = await api.delete(`/api/Contract/${contractId}/image`, {
        data: { imageUrl }
      });
      return response.data || response;
    } catch (error) {
      console.error('Error deleting contract image:', error);
      throw error;
    }
  },

  // Digital Signature Management
  // Sign contract with signature image URL
  signContract: async (contractId, signatureBase64) => {
    try {
      console.log("✍️ Signing contract:", contractId);
      console.log("🖼️ Signature length:", signatureBase64?.length);

      // Backend endpoint: PUT /api/Contract/{id}/sign-contract
      // Backend expects raw string in body, NOT an object
      // C# signature: [FromBody] string ownerSignature
      const response = await api.put(
        `/api/Contract/${contractId}/sign-contract`,
        JSON.stringify(signatureBase64) // Send as JSON string
      );

      console.log("✅ Contract signed successfully");
      return response.data || response;
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  },

  // Get signatures for a contract
  getSignatures: async (contractId) => {
    try {
      const response = await api.get(`/api/Contract/${contractId}/signatures`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching signatures:', error);
      return null;
    }
  },

  // ==================== RENTAL REQUEST ====================
  // Create rental request (User sends request to Owner)
  createRentalRequest: async (ownerId, roomId, data) => {
    try {
      console.log("📝 Creating rental request:", { ownerId, roomId, data });
      // API: POST /api/Contract/{ownerId}/rental-request/{roomId}
      const response = await api.post(`/api/Contract/${ownerId}/rental-request/${roomId}`, data);
      console.log("✅ Rental request created:", response);
      return response.data || response;
    } catch (error) {
      console.error('❌ Error creating rental request:', error);
      throw error;
    }
  },

  // Get rental requests for owner
  getRentalRequestsByOwner: async () => {
    try {
      const response = await api.get('/api/Contract/rental-requests/owner');
      if (response && response.value) {
        return response.value;
      }
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Error fetching rental requests for owner:', error);
      return [];
    }
  },

  // Get rental requests for user
  getRentalRequestsByUser: async () => {
    try {
      const response = await api.get('/api/Contract/rental-requests/user');
      if (response && response.value) {
        return response.value;
      }
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Error fetching rental requests for user:', error);
      return [];
    }
  }
};

export default contractService;
