import api from '../utils/api';

const getAllAmenities = async () => {
  try {
    console.log("🏢 Fetching all amenities (GetAll endpoint)...");
    
    // Use GetAll endpoint - this should return ALL amenities regardless of which staff created them
    const response = await api.get('/api/Amenity');
    console.log("✅ Success with /api/Amenity (GetAll):", response);
    
    // Backend returns different formats:
    // Success: {isSuccess: true, data: [...], message: "..."}
    // Fail (empty): {isSuccess: false, message: "Không có tiện ích nào.", data: null}
    if (response.isSuccess === false) {
      console.log("ℹ️ Backend indicates no amenities available:", response.message);
      return []; // Return empty array instead of throwing error
    }
    
    return response.data || response;
  } catch (error) {
    console.error('❌ Error fetching amenities from GetAll endpoint:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });
    
    // If GetAll fails, try returning an empty array for now so the UI doesn't break
    if (error.response?.status === 500) {
      console.error('🚨 Backend Internal Server Error');
      console.error('� Possible causes:');
      console.error('   - Database empty (backend returns Fail instead of Success with empty array)');
      console.error('   - Serialization issues');
      console.error('   - Database connection problems');
      
      // Return empty array to prevent UI crash
      return [];
    }
    
    throw error;
  }
};

const createAmenity = async (amenityData) => {
  try {
    console.log("🏗️ Creating amenity:", amenityData);
    
    // Use the correct endpoint: POST /api/Amenity
    const response = await api.post('/api/Amenity', amenityData);
    console.log("✅ Success creating amenity:", response);
    
    return response.data || response;
  } catch (error) {
    console.error('❌ Error creating amenity:', error);
    throw error;
  }
};

const updateAmenity = async (id, amenityData) => {
  try {
    console.log(`🔄 Updating amenity ${id}:`, amenityData);
    
    // Use the correct endpoint: PUT /api/Amenity/{id}
    const response = await api.put(`/api/Amenity/${id}`, amenityData);
    console.log("✅ Success updating amenity:", response);
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error updating amenity ${id}:`, error);
    throw error;
  }
};

const deleteAmenity = async (id) => {
  try {
    console.log(`🗑️ Deleting amenity ${id}`);
    
    // Use the correct endpoint: DELETE /api/Amenity/{id}
    const response = await api.delete(`/api/Amenity/${id}`);
    console.log("✅ Success deleting amenity");
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error deleting amenity ${id}:`, error);
    throw error;
  }
};

const amenityService = {
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};

export default amenityService;
