import api from '../utils/api';

// RoomAmenity Service - Quản lý các tiện ích của phòng
const getAllRoomAmenities = async (roomId) => {
  try {
    console.log(` Fetching all amenities for room ID: ${roomId}...`);
    
    const response = await api.get(`/api/RoomAmenity/ByRoomId/${roomId}`);
    console.log("✅ Success fetching room amenities:", response);
    
    if (response.isSuccess === false) {
      console.log("ℹ️ Backend indicates no room amenities available:", response.message);
      return [];
    }
    
    return response.data || response;
  } catch (error) {
    console.error('❌ Error fetching room amenities:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.data
    });
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No amenities found for this room');
      return [];
    }
    
    if (error.response?.status === 500) {
      console.error('🚨 Backend Internal Server Error');
      return [];
    }
    
    throw error;
  }
};

const getRoomAmenityById = async (roomAmenityId) => {
  try {
    console.log(`🔍 Fetching room amenity by ID: ${roomAmenityId}...`);
    
    const response = await api.get(`/api/RoomAmenity/${roomAmenityId}`);
    console.log("✅ Success fetching room amenity:", response);
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error fetching room amenity ${roomAmenityId}:`, error);
    throw error;
  }
};

const addAmenityToRoom = async (roomId, amenityId, amenityData = {}) => {
  try {
    console.log(`➕ Adding amenity ${amenityId} to room ${roomId}:`, amenityData);
    
    // Use proper case for backend DTO
    const requestData = {
      RoomId: roomId,
      AmenityId: amenityId,
      ...amenityData
    };
    
    console.log("📤 Sending request data:", requestData);
    
    const response = await api.post('/api/RoomAmenity', requestData);
    console.log("✅ Success adding amenity to room:", response);
    
    return response.data || response;
  } catch (error) {
    console.error('❌ Error adding amenity to room:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

const updateRoomAmenity = async (roomAmenityId, updateData) => {
  try {
    console.log(`🔄 Updating room amenity ${roomAmenityId}:`, updateData);
    
    const response = await api.put(`/api/RoomAmenity/${roomAmenityId}`, updateData);
    console.log("✅ Success updating room amenity:", response);
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error updating room amenity ${roomAmenityId}:`, error);
    throw error;
  }
};

const removeAmenityFromRoom = async (roomAmenityId) => {
  try {
    console.log(` Removing room amenity ${roomAmenityId}`);
    
    const response = await api.delete(`/api/RoomAmenity/${roomAmenityId}`);
    console.log("✅ Success removing amenity from room");
    
    return response.data || response;
  } catch (error) {
    console.error(`❌ Error removing room amenity ${roomAmenityId}:`, error);
    throw error;
  }
};

// Batch operations
const addMultipleAmenitiesToRoom = async (roomId, amenityIds) => {
  try {
    console.log(`➕ Adding multiple amenities to room ${roomId}:`, amenityIds);
    
    // Option 1: Try using the batch endpoint first
    try {
      const roomAmenityDtos = amenityIds.map(amenityId => ({ AmenityId: amenityId }));
      console.log("🔄 Trying batch endpoint:", `/api/RoomAmenity/${roomId}/Amenity`);
      console.log("📤 Batch request data:", roomAmenityDtos);
      
      const response = await api.post(`/api/RoomAmenity/${roomId}/Amenity`, roomAmenityDtos);
      console.log("✅ Success with batch endpoint:", response);
      
      return {
        successful: amenityIds.length,
        failed: 0,
        results: [{ status: 'fulfilled', value: response }]
      };
    } catch (batchError) {
      console.log("⚠️ Batch endpoint failed, falling back to individual calls:", batchError.message);
      
      // Option 2: Fallback to individual calls
      const promises = amenityIds.map(amenityId => 
        addAmenityToRoom(roomId, amenityId)
      );
      
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      console.log(`✅ Successfully added ${successful.length} amenities`);
      if (failed.length > 0) {
        console.warn(`⚠️ Failed to add ${failed.length} amenities`);
        console.warn('Failed results:', failed);
      }
      
      return {
        successful: successful.length,
        failed: failed.length,
        results: results
      };
    }
  } catch (error) {
    console.error('❌ Error adding multiple amenities to room:', error);
    throw error;
  }
};

const removeMultipleAmenitiesFromRoom = async (roomAmenityIds) => {
  try {
    console.log(` Removing multiple amenities from room:`, roomAmenityIds);
    
    const promises = roomAmenityIds.map(id => removeAmenityFromRoom(id));
    
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');
    
    console.log(`✅ Successfully removed ${successful.length} amenities`);
    if (failed.length > 0) {
      console.warn(`⚠️ Failed to remove ${failed.length} amenities`);
    }
    
    return {
      successful: successful.length,
      failed: failed.length,
      results: results
    };
  } catch (error) {
    console.error('❌ Error removing multiple amenities from room:', error);
    throw error;
  }
};

// Utility functions
const getAvailableAmenitiesForRoom = async (roomId, allAmenities = []) => {
  try {
    console.log(`🔍 Finding available amenities for room ${roomId}...`);
    
    const roomAmenities = await getAllRoomAmenities(roomId);
    const roomAmenityIds = roomAmenities.map(ra => ra.amenityId);
    
    const availableAmenities = allAmenities.filter(
      amenity => !roomAmenityIds.includes(amenity.id)
    );
    
    console.log(`✅ Found ${availableAmenities.length} available amenities`);
    return availableAmenities;
  } catch (error) {
    console.error('❌ Error finding available amenities:', error);
    throw error;
  }
};

const roomAmenityService = {
  // Basic CRUD
  getAllRoomAmenities,
  getRoomAmenityById,
  addAmenityToRoom,
  updateRoomAmenity,
  removeAmenityFromRoom,
  
  // Batch operations
  addMultipleAmenitiesToRoom,
  removeMultipleAmenitiesFromRoom,
  
  // Utility functions
  getAvailableAmenitiesForRoom,
};

export default roomAmenityService;
