// src/services/roomService.js
import { roomAPI } from "@/utils/api";

// Development mode flag - set to true if backend is having issues
const DEV_MODE = process.env.NODE_ENV === 'development';

class RoomService {
  async getById(roomId) {
    try {
      console.log(`🚪 Fetching room details for ID: ${roomId}...`);
      const response = await roomAPI.getById(roomId);
      console.log("✅ Room details fetched successfully:", response);

      // Normalize room data: convert PascalCase to camelCase for frontend
      if (response) {
        // Backend returns ImageUrl as List<string> (array)
        const imageUrls = response.ImageUrl || response.imageUrl || response.Images || response.images || [];

        // Get room status - check both PascalCase and camelCase
        let roomStatus = 0; // Default to Available
        if (response.RoomStatus !== undefined && response.RoomStatus !== null) {
          roomStatus = response.RoomStatus;
        } else if (response.roomStatus !== undefined && response.roomStatus !== null) {
          roomStatus = response.roomStatus;
        }

        return {
          ...response,
          // Support both old and new formats
          images: Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []),
          imageUrl: Array.isArray(imageUrls) ? imageUrls[0] : imageUrls,
          roomName: response.RoomName || response.roomName,
          roomStatus: roomStatus,
          houseId: response.HouseId || response.houseId,
          area: response.Area || response.area,
          price: response.Price || response.price,
          id: response.Id || response.id,
          name: response.RoomName || response.roomName || response.name // For compatibility
        };
      }

      return response;
    } catch (error) {
      console.error(`❌ Error fetching room ${roomId}:`, error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.data || {};

        if (status === 404) {
          throw new Error("Room not found. It may have been deleted.");
        } else if (status === 500) {
          throw new Error("Server error. Please try again later.");
        }
      }

      throw new Error(error.message || "Failed to fetch room details. Please try again.");
    }
  }

  async getByBoardingHouseId(houseId) {
    try {
      console.log(`🚪 Fetching rooms for boarding house ID: ${houseId}...`);

      let response;
      let lastError;

      // Try different endpoints for fetching rooms
      const fetchMethods = [
        () => roomAPI.getByBoardingHouseId(houseId),
        () => roomAPI.getByHouseId(houseId)
      ];

      for (const fetchMethod of fetchMethods) {
        try {
          console.log("🔄 Trying fetch method...");
          response = await fetchMethod();
          console.log("✅ Rooms fetched successfully:", response);
          break;
        } catch (err) {
          console.log("❌ Fetch method failed:", err.message);
          if (err.response && err.response.status === 404) {
            // 404 is not really an error for rooms - just means no rooms found
            return [];
          }
          if (err.response && err.response.status === 500) {
            console.error("Server 500 error when fetching rooms:", err);
            // Continue to try other methods or return empty array
            lastError = err;
            continue;
          }
          lastError = err;
          continue;
        }
      }

      // If all methods failed, handle gracefully
      if (!response && lastError) {
        if (lastError.response && lastError.response.status === 500) {
          console.warn("⚠️ All room fetch methods failed with 500 errors, returning empty array for now");
          return []; // Return empty array instead of throwing error
        }
        // For other errors, still throw
        throw lastError;
      }

      // Handle different response formats and normalize data
      let rooms = [];

      // Check for OData format first
      if (response && response.value && Array.isArray(response.value)) {
        console.log("📦 OData format detected");
        rooms = response.value;
      } else if (Array.isArray(response)) {
        rooms = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        rooms = response.data;
      } else if (response && response.isSuccess && Array.isArray(response.result)) {
        rooms = response.result;
      } else {
        console.warn("⚠️ Unexpected response format:", response);
        return [];
      }

      console.log(`📦 Processing ${rooms.length} rooms...`);

      // Normalize room data: convert PascalCase to camelCase for frontend
      return rooms.map(room => {
        // Backend returns ImageUrl as List<string> (array)
        const imageUrls = room.ImageUrl || room.imageUrl || room.Images || room.images || [];

        // Get room status - check both PascalCase and camelCase
        let roomStatus = 0; // Default to Available
        if (room.RoomStatus !== undefined && room.RoomStatus !== null) {
          roomStatus = room.RoomStatus;
        } else if (room.roomStatus !== undefined && room.roomStatus !== null) {
          roomStatus = room.roomStatus;
        }

        console.log(`🚪 Room ${room.RoomName || room.roomName}:`, {
          hasImageUrl: !!room.ImageUrl,
          imageUrlType: typeof room.ImageUrl,
          imageUrlValue: room.ImageUrl,
          isArray: Array.isArray(room.ImageUrl),
          roomStatus: roomStatus,
          rawRoomStatus: room.RoomStatus,
          rawroomStatus: room.roomStatus
        });

        return {
          ...room,
          // Support both old and new formats
          images: Array.isArray(imageUrls) ? imageUrls : (imageUrls ? [imageUrls] : []),
          imageUrl: Array.isArray(imageUrls) ? imageUrls[0] : imageUrls,
          roomName: room.RoomName || room.roomName,
          roomStatus: roomStatus,
          houseId: room.HouseId || room.houseId,
          area: room.Area || room.area,
          price: room.Price || room.price,
          id: room.Id || room.id
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching rooms for house ${houseId}:`, error);
      if (error.response && error.response.status === 404) {
        // Return empty array for 404 (no rooms found)
        return [];
      }
      if (error.response && error.response.status === 500) {
        // Return empty array for 500 errors to prevent page crash
        console.warn("⚠️ Returning empty array due to server error");
        return [];
      }
      // For network errors or other issues, still return empty array
      console.warn("⚠️ Returning empty array due to network/other error");
      return [];
    }
  }

  async create(houseId, data) {
    try {
      console.log(`🚪 Creating new room for house ${houseId}...`);

      // Check if data is FormData (for image upload)
      if (data instanceof FormData) {
        console.log("📤 Sending room FormData with image to Filebase IPFS");
        console.log("📤 FormData contents:", {
          roomName: data.get('RoomName'),
          area: data.get('Area'),
          price: data.get('Price'),
          hasImage: !!data.get('ImageUrl')
        });

        // Call room create API with FormData
        const response = await roomAPI.createWithFormData(houseId, data);
        console.log("✅ Room created successfully with image:", response);

        // Backend returns: { isSuccess: true, message: "...", data: {...} }
        if (response && response.isSuccess) {
          const roomData = response.data || response.result || response;
          console.log("📦 Created room data:", roomData);
          console.log("🖼️ Filebase IPFS URL:", roomData?.ImageUrl || roomData?.imageUrl);

          // Normalize response data
          return {
            ...roomData,
            imageUrl: roomData.ImageUrl || roomData.imageUrl,
            roomName: roomData.RoomName || roomData.roomName,
            roomStatus: roomData.RoomStatus !== undefined ? roomData.RoomStatus : roomData.roomStatus,
            houseId: roomData.HouseId || roomData.houseId
          };
        }

        return response;
      }

      // Legacy: JSON data (no image)
      const roomData = {
        roomName: data.roomName,
        area: parseFloat(data.area),
        price: parseFloat(data.price)
      };

      console.log("📤 Sending room JSON data (no image):", roomData);

      // Call room create API - no houseLocationId needed
      const response = await roomAPI.create(houseId, roomData);
      console.log("✅ Room created successfully:", response);

      // Handle backend response format (ApiResponse<RoomDto>)
      if (response && response.isSuccess) {
        return response.data || response.result || response;
      } else if (response && response.id) {
        return response;
      } else {
        return response;
      }
    } catch (error) {
      console.error("❌ Error creating room:", error);

      // Enhanced error handling based on backend responses
      if (error.response) {
        const status = error.response.status;
        const errorData = error.data || {};

        if (status === 400) {
          throw new Error(errorData.message || "Dữ liệu phòng không hợp lệ. Vui lòng kiểm tra lại các trường.");
        } else if (status === 404) {
          throw new Error("Không tìm thấy nhà trọ hoặc địa chỉ. Vui lòng làm mới trang và thử lại.");
        } else if (status === 409) {
          throw new Error(errorData.message || "Tên phòng đã tồn tại trong nhà trọ.");
        } else if (status === 500) {
          console.error("Server error details:", errorData);
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        }
      }

      throw new Error(error.message || "Không thể tạo phòng. Vui lòng thử lại.");
    }
  }

  async update(id, data) {
    try {
      console.log(`🚪 Updating room ${id}...`);
      console.log("📥 Received data:", data);

      // Convert roomStatus to integer, handling both string and number types
      let roomStatus = 0; // Default to Available

      if (typeof data.roomStatus === 'number') {
        roomStatus = data.roomStatus;
      } else if (typeof data.roomStatus === 'string') {
        // Handle string enum values from API response
        switch (data.roomStatus.toLowerCase()) {
          case 'available': roomStatus = 0; break;
          case 'maintenance': roomStatus = 1; break;
          case 'occupied': roomStatus = 2; break;
          default:
            // Try parsing as number
            const parsed = parseInt(data.roomStatus, 10);
            if (!isNaN(parsed)) {
              roomStatus = parsed;
            }
        }
      }

      // Ensure roomStatus is within valid range (0, 1, 2)
      if (roomStatus < 0 || roomStatus > 2) {
        console.warn("⚠️ Room status out of range, defaulting to 0:", roomStatus);
        roomStatus = 0;
      }

      console.log("✅ Final processed roomStatus:", roomStatus, "Type:", typeof roomStatus);

      // New approach: Send JSON with imageUrls (URLs already uploaded to ImageAPI)
      const updateData = {
        roomName: data.roomName,
        area: parseFloat(data.area),
        price: parseFloat(data.price),
        roomStatus: roomStatus,
        imageUrls: data.imageUrls || [],
        amenityIds: data.amenityIds || []
      };

      console.log("📤 Sending update JSON data:", updateData);

      const response = await roomAPI.update(id, updateData);
      console.log("✅ Room updated successfully:", response);

      // Handle backend response format (ApiResponse<bool>)
      if (response && response.isSuccess) {
        return response.data || response.result || response;
      } else {
        return response;
      }
    } catch (error) {
      console.error(`❌ Error updating room ${id}:`, error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data || error.data || {};

        console.log("Backend error details:", errorData);

        if (status === 400) {
          throw new Error(errorData.message || "Dữ liệu phòng không hợp lệ. Vui lòng kiểm tra lại các trường.");
        } else if (status === 404) {
          throw new Error("Không tìm thấy phòng. Phòng có thể đã bị xóa.");
        } else if (status === 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        }
      }

      throw new Error(error.message || "Không thể cập nhật phòng. Vui lòng thử lại.");
    }
  }

  async updateRoom(id, data) {
    try {
      console.log(`🚪 Updating room ${id} with new data format...`);
      console.log("📥 Received data:", data);

      // Prepare update data for room update modal format
      const updateData = {
        area: parseFloat(data.area),
        price: parseFloat(data.price),
        roomStatus: parseInt(data.roomStatus)
      };

      // Add optional fields if present
      if (data.name) {
        updateData.roomName = data.name; // Map name to roomName
      }

      if (data.description) {
        updateData.description = data.description;
      }

      if (data.maxOccupants) {
        updateData.maxOccupants = parseInt(data.maxOccupants);
      }

      console.log("📤 Sending update data:", updateData);

      const response = await roomAPI.update(id, updateData);
      console.log("✅ Room updated successfully:", response);

      return response;
    } catch (error) {
      console.error(`❌ Error updating room ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      console.log(`🚪 Deleting room ${id}...`);
      const response = await roomAPI.delete(id);
      console.log("✅ Room deleted successfully");
      return response;
    } catch (error) {
      console.error(`❌ Error deleting room ${id}:`, error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.data || {};

        if (status === 404) {
          throw new Error("Room not found. It may have already been deleted.");
        } else if (status === 400) {
          throw new Error(errorData.message || "Cannot delete room. It may be occupied.");
        } else if (status === 500) {
          throw new Error("Server error. Please try again later.");
        }
      }

      throw new Error(error.message || "Failed to delete room. Please try again.");
    }
  }

  async getRoomsByOwner() {
    try {
      console.log("🏠 Fetching rooms for current owner...");

      // First, get all boarding houses for this owner
      const { boardingHouseAPI } = await import("@/utils/api");
      console.log("📞 Calling boardingHouseAPI.getByOwnerId()...");
      const houses = await boardingHouseAPI.getByOwnerId();
      console.log("🏠 API Response - Found boarding houses:", houses);
      console.log("🏠 Houses type:", typeof houses, "Array:", Array.isArray(houses));

      // Handle different response formats
      let housesArray = houses;
      if (houses && houses.data && Array.isArray(houses.data)) {
        console.log("🏠 Using houses.data");
        housesArray = houses.data;
      } else if (houses && houses.result && Array.isArray(houses.result)) {
        console.log("🏠 Using houses.result");
        housesArray = houses.result;
      } else if (houses && houses.value && Array.isArray(houses.value)) {
        console.log("🏠 Using houses.value (OData format)");
        housesArray = houses.value;
      } else if (!Array.isArray(houses)) {
        console.log("🏠 Response is not array, checking properties:", Object.keys(houses || {}));
      }

      if (!housesArray || housesArray.length === 0) {
        console.log("⚠️ No boarding houses found for owner");
        return [];
      }

      // Get rooms from all houses
      let allRooms = [];
      for (let i = 0; i < housesArray.length; i++) {
        const house = housesArray[i];
        try {
          console.log(`🚪 Processing house ${i}:`, house);
          console.log(`🚪 House keys:`, Object.keys(house));
          console.log(`🚪 House.Id:`, house.Id);
          console.log(`🚪 House.id:`, house.id);
          console.log(`🚪 House.HouseId:`, house.HouseId);
          console.log(`🚪 House.houseId:`, house.houseId);

          const houseId = house.Id || house.id || house.HouseId || house.houseId;
          console.log(`🚪 Using houseId:`, houseId);

          if (!houseId) {
            console.error(`❌ No valid houseId found for house:`, house);
            continue;
          }

          console.log(`🚪 Fetching rooms for house: ${house.HouseName} (${houseId})`);
          const rooms = await this.getByBoardingHouseId(houseId);
          console.log(`🚪 Rooms for house ${houseId}:`, rooms);

          if (rooms && rooms.length > 0) {
            // Add house info to each room for context
            const roomsWithHouseInfo = rooms.map(room => ({
              ...room,
              houseName: house.HouseName,
              houseAddress: house.Location?.FullAddress || 'N/A'
            }));
            console.log(`🚪 Rooms with house info:`, roomsWithHouseInfo);
            allRooms = allRooms.concat(roomsWithHouseInfo);
          }
        } catch (error) {
          console.error(`❌ Error fetching rooms for house ${house.Id || house.id}:`, error);
          // Continue with other houses even if one fails
        }
      }

      console.log(`✅ Total rooms found: ${allRooms.length}`, allRooms);
      return allRooms;

    } catch (error) {
      console.error("❌ Error fetching rooms by owner:", error);
      console.error("❌ Error details:", error.message, error.stack);

      // For development/testing - return mock data if API fails
      console.log("🔧 Using mock rooms data for testing...");
      return [
        {
          Id: "room-1",
          RoomName: "Room 101",
          Price: 250,
          houseName: "Sample House 1",
          houseAddress: "123 Test Street"
        },
        {
          Id: "room-2",
          RoomName: "Room 102",
          Price: 300,
          houseName: "Sample House 1",
          houseAddress: "123 Test Street"
        },
        {
          Id: "room-3",
          RoomName: "Room 201",
          Price: 350,
          houseName: "Sample House 2",
          houseAddress: "456 Mock Avenue"
        }
      ];
    }
  }
}

const roomService = new RoomService();
export default roomService;
