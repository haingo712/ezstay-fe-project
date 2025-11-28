import api from '../utils/api';

/**
 * Get all amenities with OData support
 * @param {Object} odataParams - OData query parameters
 * @param {string} odataParams.$filter - OData filter expression (e.g., "contains(amenityName, 'wifi')")
 * @param {string} odataParams.$orderby - OData orderby expression (e.g., "amenityName asc")
 * @param {number} odataParams.$top - Number of records to return
 * @param {number} odataParams.$skip - Number of records to skip
 * @param {boolean} odataParams.$count - Whether to include total count
 * @returns {Promise} List of amenities with count
 */
const getAllAmenities = async (odataParams = {}) => {
  try {
    console.log("🏢 Fetching all amenities...", odataParams);

    // Check if we have meaningful OData params (not just default ones)
    const hasFilter = !!odataParams.$filter;
    const hasOrderby = !!odataParams.$orderby;

    let endpoint = '/api/Amenity';

    // Only use OData endpoint if we have filter or specific ordering
    if (hasFilter || hasOrderby) {
      const queryParams = new URLSearchParams();
      if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
      if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
      if (odataParams.$top) queryParams.append('$top', odataParams.$top);
      if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);
      if (odataParams.$count !== undefined) queryParams.append('$count', odataParams.$count);

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint = `/api/Amenity/odata?${queryString}`;
      }
    }

    console.log("📡 Calling endpoint:", endpoint);

    const response = await api.get(endpoint);
    console.log("✅ Success with amenities endpoint:", response);

    // Backend returns different formats:
    // OData: { value: [...], @odata.count: n } or just array
    // Success: {isSuccess: true, data: [...], message: "..."}
    // Fail (empty): {isSuccess: false, message: "...", data: null}

    if (response.isSuccess === false) {
      console.log("ℹ️ Backend indicates no amenities available:", response.message);
      return { value: [], count: 0 };
    }

    // Handle OData response format
    if (response.value !== undefined) {
      return {
        value: response.value || [],
        count: response['@odata.count'] || response.value?.length || 0
      };
    }

    // Handle standard response format {isSuccess: true, data: [...]}
    if (response.isSuccess && response.data) {
      const data = response.data;
      return {
        value: Array.isArray(data) ? data : [],
        count: Array.isArray(data) ? data.length : 0
      };
    }

    // Handle direct array response
    const data = response.data || response;
    return {
      value: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0
    };
  } catch (error) {
    console.error('❌ Error fetching amenities:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });

    if (error.response?.status === 500) {
      console.error('🚨 Backend Internal Server Error');
      return { value: [], count: 0 };
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

    console.log("✅ Response from creating amenity:", response);

    // Backend returns: { isSuccess: true/false, message: "...", data: {...} }
    // If failed (e.g., name already exists), throw error with backend message
    if (response.isSuccess === false) {
      console.log("❌ Backend returned failure:", response.message);
      throw new Error(response.message || 'Failed to create amenity');
    }

    // Success case
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

    console.log("✅ Response from updating amenity:", response);

    // Backend returns: { isSuccess: true/false, message: "...", data: {...} }
    // If failed (e.g., name already exists), throw error with backend message
    if (response.isSuccess === false) {
      console.log("❌ Backend returned failure:", response.message);
      throw new Error(response.message || 'Failed to update amenity');
    }

    // Success case
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
