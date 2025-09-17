// src/utils/api.js - API Configuration for EZStay Backend Microservices
import authService from "@/services/authService";

// API Gateway URL - All requests go through this single endpoint  
export const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "https://localhost:7000";

// Helper function for API calls
async function apiFetch(path, options = {}) {
  const baseUrl = API_GATEWAY_URL;

  if (!baseUrl) {
    throw new Error("API Gateway URL is not configured");
  }

  const url = `${baseUrl}${path}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const token = authService.getToken();
  console.log("🔑 API Request - Token:", token ? "Present" : "Missing");
  
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    console.log("🔐 Authorization header set with Bearer token");
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    // Add CORS headers - Remove credentials to fix CORS with wildcard
    mode: 'cors',
    // credentials: 'include', // Commented out to fix CORS wildcard issue
  };

  try {
  // Log request details for room API calls to help debug 500 errors
  if (url.includes('/api/Rooms') || !url.includes('UtilityRate') || !config.skipLogging) {
    console.log("🌐 API Request:", {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined
    });
  }

  const response = await fetch(url, config);

  // Log response details, especially for room API calls
  if (url.includes('/api/Rooms') || (response.status === 404 && !url.includes('UtilityRate'))) {
    console.log("📥 API Response:", {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      // Only log error data for non-404 responses to reduce console noise
      if (response.status !== 404) {
        console.log("❌ API Error Data:", errorData);
      }
    } catch (e) {
      errorData = { message: response.statusText };
    }
    
    const error = new Error(errorData.message || `Request failed with status ${response.status}`);
    error.response = response;
    error.data = errorData;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

const api = {
    get: (path, options) => apiFetch(path, { method: 'GET', ...options }),
    post: (path, data, options) => apiFetch(path, { method: 'POST', body: JSON.stringify(data), ...options }),
    put: (path, data, options) => apiFetch(path, { method: 'PUT', body: JSON.stringify(data), ...options }),
    delete: (path, options) => apiFetch(path, { method: 'DELETE', ...options }),
};

// Boarding House API
export const boardingHouseAPI = {
  getAll: () => api.get('/api/BoardingHouses'),
  getById: (id) => api.get(`/api/BoardingHouses/${id}`),
  // Backend endpoint /api/BoardingHouses/owner gets ownerId from JWT token
  getByOwnerId: (ownerId) => {
    console.log("🏠 Calling boarding house API for ownerId:", ownerId);
    console.log("🔑 Current token:", authService.getToken() ? "Present" : "Missing");
    console.log("👤 User info:", authService.getUserInfo());
    
    // The backend endpoint /owner extracts ownerId from JWT token automatically
    return api.get('/api/BoardingHouses/owner');
  },
  create: (data) => api.post('/api/BoardingHouses', data),
  update: (id, data) => api.put(`/api/BoardingHouses/${id}`, data),
  delete: (id) => api.delete(`/api/BoardingHouses/${id}`)
};

// House Location API
export const houseLocationAPI = {
  getAll: () => api.get('/api/HouseLocations'),
  getById: (id) => api.get(`/api/HouseLocations/${id}`),
  getByHouseId: (houseId) => api.get(`/api/HouseLocations/house/${houseId}`),
  create: (data) => api.post('/api/HouseLocations', data),
  update: (id, data) => api.put(`/api/HouseLocations/${id}`, data),
  delete: (id) => api.delete(`/api/HouseLocations/${id}`)
};

// Room API
export const roomAPI = {
  getAll: () => api.get('/api/Rooms'),
  getById: (id) => api.get(`/api/Rooms/${id}`),
  getByBoardingHouseId: (houseId) => api.get(`/api/Rooms/ByHouseId/${houseId}`),
  getByHouseId: (houseId) => api.get(`/api/Rooms/ByHouseId/${houseId}`), // Alias for compatibility
  
  // Simplified create method - only needs houseId according to backend CreateRoomDto
  create: (houseId, data) => {
    return api.post(`/api/Rooms/House/${houseId}`, data);
  },
  
  update: (id, data) => api.put(`/api/Rooms/${id}`, data),
  delete: (id) => api.delete(`/api/Rooms/${id}`)
};

// Amenity API
export const amenityAPI = {
  getAll: () => api.get('/api/Amenity'),
  getById: (id) => api.get(`/api/Amenity/${id}`),
  getByOwnerId: () => api.get('/api/Amenity/ByStaffId'), // Staff = Owner in this context
  getByStaffId: () => api.get('/api/Amenity/ByStaffId'),
  getAllOdata: () => api.get('/api/Amenity/odata'),
  create: (data) => api.post('/api/Amenity', data),
  update: (id, data) => api.put(`/api/Amenity/${id}`, data),
  delete: (id) => api.delete(`/api/Amenity/${id}`)
};

export default api;
