// src/utils/api.js - API Configuration for EZStay Backend Microservices

// API Gateway URL - All requests go through this single endpoint
export const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7001";

// Helper function for API calls
export async function apiFetch(path, options = {}) {
  // All requests go through API Gateway
  const baseUrl = API_GATEWAY_URL;

  if (!baseUrl) {
    throw new Error("API Gateway URL is not configured");
  }

  const url = `${baseUrl}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add authorization header if token exists
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: "include", // For cookie-based authentication
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }

      throw new Error(errorMessage);
    }

    // Handle different content types
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

// Authentication API (chưa có backend - sẽ dùng mock data)
export const authAPI = {
  login: (credentials) =>
    Promise.resolve({
      token: "mock-jwt-token",
      user: { id: "1", email: credentials.email, role: "owner" },
    }),

  register: (userData) =>
    Promise.resolve({
      token: "mock-jwt-token",
      user: { id: "1", email: userData.email, role: "owner" },
    }),

  logout: () => Promise.resolve({}),

  refreshToken: () => Promise.resolve({ token: "new-mock-token" }),

  getProfile: () =>
    Promise.resolve({
      id: "1",
      email: "owner@example.com",
      role: "owner",
    }),
};

// Boarding House API - Đã hoàn thành
export const boardingHouseAPI = {
  // Lấy tất cả nhà trọ
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/BoardingHouses${queryString ? `?${queryString}` : ""}`
    );
  },

  // Lấy nhà trọ theo owner ID
  getByOwnerId: (ownerId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/BoardingHouses/owner/${ownerId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  // Lấy nhà trọ theo ID
  getById: (id) => apiFetch(`/api/BoardingHouses/${id}`),

  // Tạo nhà trọ mới
  create: (houseData) =>
    apiFetch("/api/BoardingHouses", {
      method: "POST",
      body: JSON.stringify(houseData),
    }),

  // Cập nhật nhà trọ
  update: (id, houseData) =>
    apiFetch(`/api/BoardingHouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(houseData),
    }),

  // Xóa nhà trọ
  delete: (id) =>
    apiFetch(`/api/BoardingHouses/${id}`, {
      method: "DELETE",
    }),
};

// Room API - Đã hoàn thành
export const roomAPI = {
  // Lấy tất cả phòng
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/Rooms${queryString ? `?${queryString}` : ""}`);
  },

  // Lấy phòng theo house ID
  getByHouseId: (houseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/Rooms/ByHouseId/${houseId}${queryString ? `?${queryString}` : ""}`
    );
  },

  // Lấy phòng theo house location ID
  getByHouseLocationId: (locationId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/Rooms/ByHouseLocationId/${locationId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  // Lấy phòng theo ID
  getById: (id) => apiFetch(`/api/Rooms/${id}`),

  // Tạo phòng mới
  create: (roomData) =>
    apiFetch("/api/Rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    }),

  // Cập nhật phòng
  update: (id, roomData) =>
    apiFetch(`/api/Rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    }),

  // Xóa phòng
  delete: (id) =>
    apiFetch(`/api/Rooms/${id}`, {
      method: "DELETE",
    }),
};

// Amenity API - Đã hoàn thành
export const amenityAPI = {
  // Lấy tiện nghi theo owner ID
  getByOwnerId: (ownerId) => apiFetch(`/api/Amenity/ByOwnerId/${ownerId}`),

  // Lấy tiện nghi theo owner ID với OData
  getByOwnerIdOData: (ownerId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/Amenity/ByOwnerId/odata/${ownerId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  // Lấy tên tiện nghi duy nhất
  getDistinctNames: () => apiFetch("/api/Amenity/DistinctNames"),

  // Lấy tiện nghi theo ID
  getById: (id) => apiFetch(`/api/Amenity/${id}`),

  // Tạo tiện nghi mới
  create: (amenityData) =>
    apiFetch("/api/Amenity", {
      method: "POST",
      body: JSON.stringify(amenityData),
    }),

  // Cập nhật tiện nghi
  update: (id, amenityData) =>
    apiFetch(`/api/Amenity/${id}`, {
      method: "PUT",
      body: JSON.stringify(amenityData),
    }),

  // Xóa tiện nghi
  delete: (id) =>
    apiFetch(`/api/Amenity/${id}`, {
      method: "DELETE",
    }),
};

// House Location API - Đã hoàn thành
export const houseLocationAPI = {
  // Lấy tất cả locations
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/HouseLocations${queryString ? `?${queryString}` : ""}`
    );
  },

  // Lấy location theo house ID
  getByHouseId: (houseId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/HouseLocations/house/${houseId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  // Lấy location theo ID
  getById: (id) => apiFetch(`/api/HouseLocations/${id}`),

  // Tạo location mới
  create: (locationData) =>
    apiFetch("/api/HouseLocations", {
      method: "POST",
      body: JSON.stringify(locationData),
    }),

  // Cập nhật location
  update: (id, locationData) =>
    apiFetch(`/api/HouseLocations/${id}`, {
      method: "PUT",
      body: JSON.stringify(locationData),
    }),

  // Xóa location
  delete: (id) =>
    apiFetch(`/api/HouseLocations/${id}`, {
      method: "DELETE",
    }),
};

// Room Amenity API - Đã hoàn thành
export const roomAmenityAPI = {
  // Lấy tất cả room amenity
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/api/RoomAmenity${queryString ? `?${queryString}` : ""}`);
  },

  // Lấy amenity theo room ID
  getByRoomId: (roomId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(
      `/api/RoomAmenity/ByRoomId/${roomId}${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  // Lấy room amenity theo ID
  getById: (id) => apiFetch(`/api/RoomAmenity/${id}`),

  // Tạo room amenity mới
  create: (roomAmenityData) =>
    apiFetch("/api/RoomAmenity", {
      method: "POST",
      body: JSON.stringify(roomAmenityData),
    }),

  // Cập nhật room amenity
  update: (id, roomAmenityData) =>
    apiFetch(`/api/RoomAmenity/${id}`, {
      method: "PUT",
      body: JSON.stringify(roomAmenityData),
    }),

  // Xóa room amenity
  delete: (id) =>
    apiFetch(`/api/RoomAmenity/${id}`, {
      method: "DELETE",
    }),
};

// Legacy API exports for backward compatibility
export const propertyAPI = roomAPI; // Alias for room API

// Payment API chưa có backend - sử dụng mock data
export const paymentAPI = {
  getBills: () => Promise.resolve([]),
  createBill: () => Promise.resolve({ success: true }),
  payBill: () => Promise.resolve({ success: true }),
};

// Notification API chưa có backend - sử dụng mock data
export const notificationAPI = {
  getNotifications: () => Promise.resolve([]),
  markAsRead: () => Promise.resolve({ success: true }),
  sendNotification: () => Promise.resolve({ success: true }),
};

// Utility function to check API Gateway health
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return { gateway: response.ok };
  } catch {
    return { gateway: false };
  }
};

export default apiFetch;
