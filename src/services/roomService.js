// src/services/roomService.js
import { roomAPI, houseLocationAPI } from "@/utils/api";

// Development mode flag - set to true if backend is having issues
const DEV_MODE = process.env.NODE_ENV === 'development';

class RoomService {
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
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && response.isSuccess && Array.isArray(response.result)) {
        return response.result;
      } else {
        console.warn("⚠️ Unexpected response format, returning empty array");
        return [];
      }
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

  // helper to expose house locations to UI
  async getHouseLocations(houseId) {
    try {
      const res = await houseLocationAPI.getByHouseId(houseId);
      return res;
    } catch (err) {
      console.error("Error fetching house locations:", err);
      return [];
    }
  }

  async create(houseId, data, explicitHouseLocationId = null) {
    try {
      console.log(`🚪 Creating new room for house ${houseId}...`, data);
  // We intentionally do not require or fetch houseLocation here.
  // If an explicit houseLocationId was passed, it will be used; otherwise the house-only endpoint is called.
  const houseLocationId = explicitHouseLocationId || null;
      
      // Prepare room data according to backend CreateRoomDto
      const roomData = {
        roomName: data.roomName,
        area: parseFloat(data.area),
        price: parseFloat(data.price)
      };

      console.log("📤 Sending room data:", roomData);
      
  // Call room create API; api.js will pick the correct route (with or without location)
  const response = await roomAPI.create(houseId, houseLocationId, roomData);
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
      console.log(`🚪 Updating room ${id}...`, data);
      
      // Prepare update data according to backend UpdateRoomDto
      // Note: UpdateRoomDto doesn't have RoomName field
      const updateData = {
        area: parseFloat(data.area),
        price: parseFloat(data.price),
        roomStatus: data.roomStatus || 0 // 0 = Available, 1 = Occupied, 2 = Maintenance
      };

      console.log("📤 Sending update data:", updateData);

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
        const errorData = error.data || {};
        
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
}

const roomService = new RoomService();
export default roomService;
