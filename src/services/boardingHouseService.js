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

  /**
   * Get ranked boarding houses based on rating or sentiment
   * @param {string} type - "Rating" or "Sentiment"
   * @param {string} order - "desc" or "asc" (default: "desc")
   * @param {number} limit - Number of results (default: 10)
   * @returns {Promise<Array>} List of ranked boarding houses
   */
  async getRankedHouses(type = "Rating", order = "desc", limit = 10) {
    try {
      console.log(`🏆 Fetching ranked boarding houses... Type: ${type}, Order: ${order}, Limit: ${limit}`);
      const response = await boardingHouseAPI.getRanked(type, order, limit);
      console.log("✅ Ranked boarding houses fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching ranked boarding houses:", error);
      throw error;
    }
  }

  /**
   * Get ranked boarding houses PUBLIC (no auth required) - for homepage guest access
   * @param {string} type - "Rating" or "Sentiment"
   * @param {string} order - "desc" or "asc" (default: "desc")
   * @param {number} limit - Number of results (default: 10)
   * @returns {Promise<Array>} List of ranked boarding houses
   */
  async getRankedHousesPublic(type = "Rating", order = "desc", limit = 10) {
    try {
      console.log(`🌐🏆 Fetching PUBLIC ranked boarding houses... Type: ${type}, Order: ${order}, Limit: ${limit}`);
      
      // Use native fetch directly to avoid axios interceptors
      const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
      const params = new URLSearchParams({ type, order, limit: limit.toString() });
      const response = await fetch(`${baseUrl}/api/BoardingHouses/rank?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Public ranked boarding houses fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching public ranked boarding houses:", error);
      // Return empty array instead of throwing for guest access
      return [];
    }
  }

  /**
   * Get rating summary for a specific boarding house
   * @param {string} id - Boarding house ID
   * @returns {Promise<Object>} Rating summary with star distribution and reviews
   */
  async getRatingSummary(id) {
    try {
      console.log(`⭐ Fetching rating summary for boarding house: ${id}...`);
      const response = await boardingHouseAPI.getRatingSummary(id);
      console.log("✅ Rating summary fetched successfully:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching rating summary for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get sentiment summary for a specific boarding house (using Python ML)
   * @param {string} id - Boarding house ID
   * @returns {Promise<Object>} Sentiment summary with positive/neutral/negative counts
   */
  async getSentimentSummary(id) {
    try {
      console.log(`💭 Fetching sentiment summary for boarding house: ${id}...`);
      const response = await boardingHouseAPI.getSentimentSummary(id);
      console.log("✅ Sentiment summary fetched successfully:", response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching sentiment summary for ${id}:`, error);
      throw error;
    }
  }

}

const boardingHouseService = new BoardingHouseService();
export default boardingHouseService;
