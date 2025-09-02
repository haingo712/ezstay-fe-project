import api from '../utils/api';

const getAmenitiesForStaff = async () => {
  try {
    console.log("🏢 Fetching amenities for staff...");
    
    // Temporary: Try GetAll endpoint first for testing
    let response;
    try {
      console.log("🔄 Trying GetAll endpoint for testing...");
      response = await api.get('/api/Amenity');
      console.log("✅ Success with /api/Amenity (GetAll):", response);
      return response.data || response;
    } catch (error) {
      console.log("❌ GetAll endpoint failed, trying staff-specific...");
      // If GetAll fails, try staff endpoint
      response = await api.get('/api/Amenity/ByStaffId');
      console.log("✅ Success with /api/Amenity/ByStaffId:", response);
      return response.data || response;
    }
  } catch (error) {
    console.error('❌ Error fetching amenities:', error);
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
  getAmenitiesForStaff,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};

export default amenityService;
