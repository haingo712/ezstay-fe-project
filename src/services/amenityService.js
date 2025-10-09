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
    console.log("🏗️ Creating amenity with FormData");
    console.log("📤 FormData contents:", {
      amenityName: amenityData.get('AmenityName'),
      hasImage: !!amenityData.get('ImageUrl')
    });
    
    // POST /api/Amenity with FormData (multipart/form-data)
    // Backend flow:
    // 1. Receives file from FormData
    // 2. Uploads file to Filebase IPFS storage via ImageAPI microservice
    // 3. Returns IPFS URL (e.g., https://ipfs.filebase.io/ipfs/Qm...)
    // 4. Saves amenity with IPFS URL to MongoDB
    const response = await api.postFormData('/api/Amenity', amenityData);
    
    console.log("✅ Success creating amenity:", response);
    
    // Backend returns: { isSuccess: true, message: "...", data: {...} }
    // data contains: { id, amenityName, imageUrl (IPFS URL from Filebase), createdAt, updatedAt }
    if (response.isSuccess) {
      console.log("📦 Created amenity data:", response.data);
      console.log("🖼️ Filebase IPFS URL:", response.data?.imageUrl);
      return response.data; // Return the amenity object with IPFS URL
    }
    
    // If not successful, return full response
    return response.data || response;
  } catch (error) {
    console.error('❌ Error creating amenity:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });
    throw error;
  }
};

const updateAmenity = async (id, amenityData) => {
  try {
    console.log(`🔄 Updating amenity ${id}`);
    console.log("📤 FormData contents:", {
      amenityName: amenityData.get('AmenityName'),
      hasNewImage: !!amenityData.get('ImageUrl')
    });
    
    // PUT /api/Amenity/{id} with FormData (multipart/form-data)
    // Backend flow:
    // 1. Receives updated data from FormData
    // 2. If new image file provided, uploads to Filebase IPFS via ImageAPI
    // 3. Returns updated IPFS URL or keeps existing URL if no new image
    // 4. Updates amenity in MongoDB
    const response = await api.putFormData(`/api/Amenity/${id}`, amenityData);
    
    console.log("✅ Success updating amenity:", response);
    
    // Backend returns: { isSuccess: true, message: "...", data: {...} }
    if (response.isSuccess) {
      console.log("📦 Updated amenity data:", response.data);
      console.log("🖼️ Filebase IPFS URL:", response.data?.imageUrl);
      return response.data; // Return the updated amenity object
    }
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error updating amenity ${id}:`, error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });
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
