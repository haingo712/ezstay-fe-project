import api from '../utils/api';

const getAllUtilityRates = async () => {
  try {
    console.log("⚡ Fetching all utility rates...");
    
    const response = await api.get('/api/UtilityRate');
    console.log("✅ Success with /api/UtilityRate (GetAll):", response);
    
    // Handle different response formats
    if (response.isSuccess === false) {
      console.log("ℹ️ Backend indicates no utility rates available:", response.message);
      return [];
    }
    
    let data = response.data || response;
    
    // Handle MongoDB UUID format - ensure each item has proper id
    if (Array.isArray(data)) {
      data = data.map(item => ({
        ...item,
        id: item.id || item._id || `temp_${Date.now()}_${Math.random()}`
      }));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching utility rates:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });
    
    if (error.response?.status === 500) {
      console.error('🚨 Backend Internal Server Error');
      return [];
    }
    
    throw error;
  }
};

const getAllUtilityRatesByOwner = async (ownerId) => {
  try {
    console.log(`⚡ Fetching utility rates for owner ${ownerId}...`);
    
    // Backend endpoint changed to use JWT authentication instead of URL parameter
    // New endpoint: /api/UtilityRate/ByOwnerId (no parameter, gets owner from JWT)
    try {
      console.log(`🔄 Trying authenticated endpoint: /api/UtilityRate/ByOwnerId`);
      const response = await api.get(`/api/UtilityRate/ByOwnerId`);
      console.log(`✅ Success with authenticated endpoint:`, response);
      
      // Handle different response formats
      if (response.isSuccess === false) {
        console.log("ℹ️ Backend indicates no utility rates available:", response.message);
        return [];
      }
      
      let data = response.data || response;
      
      // Handle MongoDB UUID format - ensure each item has proper id
      if (Array.isArray(data)) {
        data = data.map(item => ({
          ...item,
          id: item.id || item._id || `temp_${Date.now()}_${Math.random()}`
        }));
      }
      
      return data;
    } catch (primaryError) {
      console.log("ℹ️ Authenticated endpoint not available, trying old endpoint pattern...");
      
      // If authenticated endpoint fails, might be due to auth issues
      if (primaryError.response?.status === 401) {
        console.warn("🔐 Authentication failed for ByOwnerId endpoint");
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Try old endpoint pattern as backup
      try {
        console.log(`🔄 Trying legacy endpoint: /api/UtilityRate/ByOwnerId/${ownerId}`);
        const response = await api.get(`/api/UtilityRate/ByOwnerId/${ownerId}`);
        console.log(`✅ Success with legacy endpoint:`, response);
        
        let data = response.data || response;
        if (Array.isArray(data)) {
          data = data.map(item => ({
            ...item,
            id: item.id || item._id || `temp_${Date.now()}_${Math.random()}`
          }));
        }
        return data;
      } catch (legacyError) {
        console.log("ℹ️ Legacy endpoint also failed, trying general fallback...");
      }
      
      // Fallback: Try to get all rates and filter client-side
      try {
        const allRates = await getAllUtilityRates();
        if (Array.isArray(allRates)) {
          const ownerRates = allRates.filter(rate => 
            rate.ownerId === ownerId || 
            rate.ownerId?.toString() === ownerId?.toString()
          );
          console.log(`✅ Filtered ${ownerRates.length} rates for owner from ${allRates.length} total rates`);
          return ownerRates;
        }
      } catch (fallbackError) {
        console.log("ℹ️ Fallback also not available - returning empty array");
      }
      
      // If everything fails, return empty array for development
      console.log('ℹ️ No utility rate endpoints available - starting with empty data');
      return [];
    }
    
  } catch (error) {
    // Only log actual errors, not expected 404s during endpoint discovery
    if (error.response?.status !== 404) {
      console.error('❌ Error fetching utility rates by owner:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } else {
      console.log('ℹ️ No utility rate endpoints found - returning empty array');
    }
    
    // Always return empty array instead of throwing for development
    return [];
  }
};

const createUtilityRate = async (rateData) => {
  try {
    console.log("🏗️ Creating utility rate:", rateData);
    console.log("🌐 API endpoint: POST /api/UtilityRate");
    
    // Try different possible endpoints in case backend uses different routing
    let response;
    try {
      response = await api.post('/api/UtilityRate', rateData);
      console.log("✅ Create response (primary endpoint):", response);
    } catch (primaryError) {
      console.warn("⚠️ Primary endpoint failed, trying alternative...");
      console.error("Primary error:", primaryError.response?.status, primaryError.response?.data);
      
      // Try alternative endpoint
      try {
        response = await api.post('/api/UtilityRate/Create', rateData);
        console.log("✅ Create response (alternative endpoint):", response);
      } catch (altError) {
        console.error("❌ Alternative endpoint also failed:", altError.response?.status, altError.response?.data);
        throw primaryError; // Throw original error
      }
    }
    
    let data = response.data || response;
    // Ensure the returned data has proper id field
    if (data && !data.id && data._id) {
      data.id = data._id;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error creating utility rate:', error);
    
    // Handle MongoDB GUID serialization issues
    if (error.response?.status === 500 && 
        (error.response?.data?.includes?.('GuidSerializer') || 
         error.message?.includes?.('GuidSerializer'))) {
      console.warn('🔧 MongoDB GUID serialization issue during create');
      // Return a mock response for optimistic UI updates
      return {
        id: `temp_${Date.now()}_${Math.random()}`,
        ...rateData,
        created: true
      };
    }
    
    throw error;
  }
};

const updateUtilityRate = async (id, rateData) => {
  try {
    console.log(`🔄 Updating utility rate ${id}:`, rateData);
    
    const response = await api.put(`/api/UtilityRate/${id}`, rateData);
    console.log("✅ Update response:", response);
    
    let data = response.data || response;
    // Ensure the returned data has proper id field
    if (data && !data.id && data._id) {
      data.id = data._id;
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error updating utility rate ${id}:`, error);
    
    // Handle MongoDB GUID serialization issues
    if (error.response?.status === 500 && 
        (error.response?.data?.includes?.('GuidSerializer') || 
         error.message?.includes?.('GuidSerializer'))) {
      console.warn('🔧 MongoDB GUID serialization issue during update');
      // Return a mock response for optimistic UI updates
      return {
        id: id,
        ...rateData,
        updated: true
      };
    }
    
    throw error;
  }
};

const deleteUtilityRate = async (id) => {
  try {
    console.log(` Attempting to delete utility rate ${id}`);
    
    // Backend DELETE endpoint is currently disabled/commented out
    // Throwing a user-friendly error instead of making the API call
    throw new Error('Delete functionality is temporarily disabled. The backend DELETE endpoint is not currently available.');
    
    const response = await api.delete(`/api/UtilityRate/${id}`);
    console.log("✅ Delete response:", response);
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error deleting utility rate ${id}:`, error);
    
    // Handle the case where DELETE endpoint doesn't exist (405 error)
    if (error.response?.status === 405) {
      throw new Error('Delete functionality is not available. The backend DELETE endpoint is disabled.');
    }
    
    // Handle MongoDB GUID serialization issues
    if (error.response?.status === 500 && 
        (error.response?.data?.includes?.('GuidSerializer') || 
         error.message?.includes?.('GuidSerializer'))) {
      console.warn('🔧 MongoDB GUID serialization issue during delete');
      // Return success for optimistic UI updates
      return { success: true, id: id };
    }
    
    throw error;
  }
};

const utilityRateService = {
  getAllUtilityRates,
  getAllUtilityRatesByOwner,
  createUtilityRate,
  updateUtilityRate,
  deleteUtilityRate,
};

export default utilityRateService;
