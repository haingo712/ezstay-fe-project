// src/services/boardingHouseService.js
import { boardingHouseAPI } from "@/utils/api";

class BoardingHouseService {
  constructor() {
    this.baseUrl = "/api/BoardingHouses";
  }

  // Lấy tất cả boarding houses
  async getAll() {
    try {
      console.log("🏠 Fetching all boarding houses...");
      const response = await boardingHouseAPI.getAll();
      console.log("✅ Boarding houses fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching boarding houses:", error);
      throw error;
    }
  }

  // Lấy boarding house theo ID
  async getById(id) {
    try {
      console.log(`🏠 Fetching boarding house with ID: ${id}...`);
      const response = await boardingHouseAPI.getById(id);
      console.log("✅ Boarding house fetched successfully:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching boarding house ${id}:`, error);
      throw error;
    }
  }

  // Lấy boarding houses theo owner ID
  async getByOwnerId(ownerId) {
    try {
      console.log(`🏠 Fetching boarding houses for owner: ${ownerId}...`);
      const response = await boardingHouseAPI.getByOwnerId(ownerId);
      console.log("✅ Owner's boarding houses fetched successfully:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching boarding houses for owner ${ownerId}:`, error);
      throw error;
    }
  }

  // Tạo boarding house mới
  async create(data) {
    try {
      console.log("🏠 Creating new boarding house...", data);
      const response = await boardingHouseAPI.create(data);
      console.log("✅ Boarding house created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating boarding house:", error);
      throw error;
    }
  }

  // Cập nhật boarding house
  async update(id, data) {
    try {
      console.log(`🏠 Updating boarding house ${id}...`, data);
      const response = await boardingHouseAPI.update(id, data);
      console.log("✅ Boarding house updated successfully:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error updating boarding house ${id}:`, error);
      throw error;
    }
  }

  // Xóa boarding house
  async delete(id) {
    try {
      console.log(`🏠 Deleting boarding house ${id}...`);
      const response = await boardingHouseAPI.delete(id);
      console.log("✅ Boarding house deleted successfully");
      return response;
    } catch (error) {
      console.error(`❌ Error deleting boarding house ${id}:`, error);
      throw error;
    }
  }

  // Tìm kiếm boarding houses (có thể mở rộng sau)
  async search(params) {
    try {
      console.log("🔍 Searching boarding houses...", params);
      const queryString = new URLSearchParams(params).toString();
      const response = await boardingHouseAPI.getAll();
      // Client-side filtering for now, can be moved to backend later
      return response.filter(house => {
        if (params.q && !house.houseName.toLowerCase().includes(params.q.toLowerCase()) && 
            !house.description.toLowerCase().includes(params.q.toLowerCase())) {
          return false;
        }
        return true;
      });
    } catch (error) {
      console.error("❌ Error searching boarding houses:", error);
      throw error;
    }
  }


}

const boardingHouseService = new BoardingHouseService();
export default boardingHouseService;
