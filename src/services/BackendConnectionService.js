// src/services/BackendConnectionService.js
// Service để kiểm tra và đồng bộ backend-frontend

import {
  boardingHouseAPI,
  roomAPI,
  amenityAPI,
  houseLocationAPI,
  roomAmenityAPI,
} from "../utils/api.js";

class BackendConnectionService {
  constructor() {
    this.isConnected = false;
    this.services = [
      "BoardingHouseAPI",
      "RoomAPI",
      "AmenityAPI",
      "HouseLocationAPI",
      "RoomAmenityAPI",
    ];
    this.connectionStatus = {};
  }

  // Kiểm tra kết nối với backend
  async checkConnection() {
    console.log("🔍 Checking backend connection...");

    try {
      // Test API Gateway health - API Gateway không có swagger, chỉ test endpoint thông thường
      const response = await fetch(process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7001", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // API Gateway sẽ trả về 404 là bình thường vì không có route gốc
      // Miễn là không có network error là OK
      console.log("✅ API Gateway is running (status:", response.status, ")");
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("❌ API Gateway connection failed:", error);
      this.isConnected = false;
      return false;
    }
  }

  // Test tất cả các API endpoints
  async testAllServices() {
    const results = {};

    // Test BoardingHouse API
    try {
      const mockOwnerId = process.env.NEXT_PUBLIC_MOCK_OWNER_ID;
      const houses = await boardingHouseAPI.getByOwnerId(mockOwnerId);
      results.BoardingHouseAPI = { status: "success", data: houses };
      console.log("✅ BoardingHouseAPI working");
    } catch (error) {
      results.BoardingHouseAPI = { status: "error", error: error.message };
      console.log("❌ BoardingHouseAPI failed:", error.message);
    }

    // Test Room API
    try {
      const rooms = await roomAPI.getAll();
      results.RoomAPI = { status: "success", data: rooms };
      console.log("✅ RoomAPI working");
    } catch (error) {
      results.RoomAPI = { status: "error", error: error.message };
      console.log("❌ RoomAPI failed:", error.message);
    }

    // Test Amenity API
    try {
      const mockOwnerId = process.env.NEXT_PUBLIC_MOCK_OWNER_ID;
      const amenities = await amenityAPI.getByOwnerId(mockOwnerId);
      results.AmenityAPI = { status: "success", data: amenities };
      console.log("✅ AmenityAPI working");
    } catch (error) {
      results.AmenityAPI = { status: "error", error: error.message };
      console.log("❌ AmenityAPI failed:", error.message);
    }

    // Test HouseLocation API
    try {
      const locations = await houseLocationAPI.getAll();
      results.HouseLocationAPI = { status: "success", data: locations };
      console.log("✅ HouseLocationAPI working");
    } catch (error) {
      results.HouseLocationAPI = { status: "error", error: error.message };
      console.log("❌ HouseLocationAPI failed:", error.message);
    }

    // Test RoomAmenity API
    try {
      const roomAmenities = await roomAmenityAPI.getAll();
      results.RoomAmenityAPI = { status: "success", data: roomAmenities };
      console.log("✅ RoomAmenityAPI working");
    } catch (error) {
      results.RoomAmenityAPI = { status: "error", error: error.message };
      console.log("❌ RoomAmenityAPI failed:", error.message);
    }

    this.connectionStatus = results;
    return results;
  }

  // Tạo dữ liệu mẫu để test
  async createSampleData() {
    console.log("🏗️ Creating sample data...");

    try {
      const mockOwnerId = process.env.NEXT_PUBLIC_MOCK_OWNER_ID;

      // 1. Tạo Boarding House
      const houseData = {
        ownerId: mockOwnerId,
        houseName: "EZStay Test House",
        description: "Nhà trọ test từ frontend-backend connection",
      };

      const house = await boardingHouseAPI.create(houseData);
      console.log("✅ Created boarding house:", house);

      // 2. Tạo Amenities
      const amenityData = {
        ownerId: mockOwnerId,
        amenityName: "WiFi miễn phí",
      };

      const amenity = await amenityAPI.create(amenityData);
      console.log("✅ Created amenity:", amenity);

      // 3. Tạo Room
      const roomData = {
        houseId: house.id,
        roomName: "Phòng Test 101",
        area: 25,
        price: 3000000,
        maxTenants: 2,
        rentalCondition: "Không hút thuốc",
        isAvailable: true,
      };

      const room = await roomAPI.create(roomData);
      console.log("✅ Created room:", room);

      // 4. Tạo House Location
      const locationData = {
        houseId: house.id,
        address: "123 Đường Test",
        ward: "Phường Test",
        district: "Quận Test",
        city: "TP.HCM",
      };

      const location = await houseLocationAPI.create(locationData);
      console.log("✅ Created location:", location);

      // 5. Gán Amenity cho Room
      const roomAmenityData = {
        roomId: room.id,
        amenityId: amenity.id,
      };

      const roomAmenity = await roomAmenityAPI.create(roomAmenityData);
      console.log("✅ Created room-amenity link:", roomAmenity);

      return {
        house,
        room,
        amenity,
        location,
        roomAmenity,
      };
    } catch (error) {
      console.error("❌ Failed to create sample data:", error);
      throw error;
    }
  }

  // Đồng bộ dữ liệu từ backend
  async syncData() {
    console.log("🔄 Syncing data from backend...");

    try {
      const mockOwnerId = process.env.NEXT_PUBLIC_MOCK_OWNER_ID;

      // Lấy tất cả dữ liệu từ backend
      const [houses, rooms, amenities, locations] = await Promise.all([
        boardingHouseAPI.getByOwnerId(mockOwnerId),
        roomAPI.getAll(),
        amenityAPI.getByOwnerId(mockOwnerId),
        houseLocationAPI.getAll(),
      ]);

      console.log("📊 Synced data:", {
        houses: houses.length,
        rooms: rooms.length,
        amenities: amenities.length,
        locations: locations.length,
      });

      return {
        houses,
        rooms,
        amenities,
        locations,
      };
    } catch (error) {
      console.error("❌ Data sync failed:", error);
      throw error;
    }
  }

  // Lấy trạng thái kết nối hiện tại
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      services: this.connectionStatus,
    };
  }
}

// Export singleton instance
export const backendConnection = new BackendConnectionService();
export default BackendConnectionService;
