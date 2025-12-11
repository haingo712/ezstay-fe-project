// src/utils/api.js - API Configuration for EZStay Backend Microservices
import authService from "@/services/authService";

// API Gateway URL - All requests go through this single endpoint  
// Uses NEXT_PUBLIC_API_GATEWAY_URL from .env file
export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// Public API fetch - does NOT include auth token (for guest access)
async function publicApiFetch(path, options = {}) {
  const baseUrl = API_GATEWAY_URL;

  if (!baseUrl) {
    throw new Error("API Gateway URL is not configured");
  }

  const url = `${baseUrl}${path}`;
  console.log("🌐 Public API Request (no auth):", path);

  const config = {
    ...options,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    mode: 'cors',
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
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
    console.error("Public API Fetch Error:", error);
    throw error;
  }
}

// Export publicApiFetch for public endpoints
export { publicApiFetch };

// Helper function for API calls (with auth)
async function apiFetch(path, options = {}) {
  const baseUrl = API_GATEWAY_URL;

  if (!baseUrl) {
    throw new Error("API Gateway URL is not configured");
  }

  const url = `${baseUrl}${path}`;

  const token = authService.getToken();
  console.log("🔑 API Request - Token:", token ? "Present" : "Missing");

  // Check if this is a FormData request (skipContentType flag)
  const isFormData = options.headers?.skipContentType === true;

  const defaultHeaders = {
    "Accept": "application/json",
  };

  // Only add Content-Type for JSON requests, NOT for FormData
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
    console.log("🔐 Authorization header set with Bearer token");
  }

  // Build config headers
  const configHeaders = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // Remove the internal flag
  delete configHeaders.skipContentType;

  const config = {
    ...options,
    headers: configHeaders,
    mode: 'cors',
  };

  try {
    // Enhanced logging for debugging
    if (isFormData) {
      console.log("📤 FormData Request:", {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        bodyType: config.body?.constructor?.name || typeof config.body,
        hasContentType: !!config.headers['Content-Type']
      });

      // List all headers being sent
      console.log("🔍 All headers:", Object.keys(config.headers).map(key => `${key}: ${config.headers[key]}`));
    } else if (url.includes('/api/Rooms') || !url.includes('UtilityRate') || !config.skipLogging) {
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

          // Log ASP.NET Core validation errors in detail
          if (errorData.errors) {
            console.log("🔍 Validation Errors:", errorData.errors);
            Object.keys(errorData.errors).forEach(field => {
              console.log(`  ❌ ${field}:`, errorData.errors[field]);
            });
          }
        }
      } catch (e) {
        errorData = { message: response.statusText };
      }

      // For 404 errors, return null instead of throwing to prevent error overlay
      if (response.status === 404) {
        console.warn(`⚠️ Resource not found (404): ${url}`);
        return null;
      }

      // Build detailed error message for validation errors
      let errorMessage = errorData.message || errorData.title || `Request failed with status ${response.status}`;
      if (errorData.errors && typeof errorData.errors === 'object') {
        const validationMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        errorMessage = `${errorMessage} - ${validationMessages}`;
      }

      const error = new Error(errorMessage);
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

// Export apiFetch for direct use in services
export { apiFetch };

const api = {
  get: (path, options) => apiFetch(path, { method: 'GET', ...options }),
  post: (path, data, options) => apiFetch(path, { method: 'POST', body: JSON.stringify(data), ...options }),
  put: (path, data, options) => apiFetch(path, { method: 'PUT', body: JSON.stringify(data), ...options }),
  patch: (path, data, options) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(data), ...options }),
  delete: (path, options) => apiFetch(path, { method: 'DELETE', ...options }),

  // FormData methods - don't stringify body, let browser set Content-Type with boundary
  postFormData: (path, formData, options = {}) => {
    return apiFetch(path, {
      method: 'POST',
      body: formData,
      headers: {
        skipContentType: true, // Signal to apiFetch to skip Content-Type header
        ...(options.headers || {})
      },
      ...options
    });
  },

  putFormData: (path, formData, options = {}) => {
    return apiFetch(path, {
      method: 'PUT',
      body: formData,
      headers: {
        skipContentType: true, // Signal to apiFetch to skip Content-Type header
        ...(options.headers || {})
      },
      ...options
    });
  },
};

// Public API object - no authentication required (for guest access)
const publicApi = {
  get: (path, options) => publicApiFetch(path, { method: 'GET', ...options }),
  post: (path, data, options) => publicApiFetch(path, { method: 'POST', body: JSON.stringify(data), ...options }),
};

export { publicApi };

// Boarding House API
export const boardingHouseAPI = {
  // Public endpoints (no auth required)
  getAllPublic: () => publicApi.get('/api/BoardingHouses'),
  getByIdPublic: (id) => publicApi.get(`/api/BoardingHouses/${id}`),
  getRankedPublic: (type, order = 'desc', limit = 10) => {
    const params = new URLSearchParams({ type, order, limit: limit.toString() });
    return publicApi.get(`/api/BoardingHouses/rank?${params.toString()}`);
  },

  // Authenticated endpoints
  getAll: () => api.get('/api/BoardingHouses'),
  getById: (id) => api.get(`/api/BoardingHouses/${id}`),
  // Backend endpoint /api/BoardingHouses/owner gets ownerId from JWT token
  getByOwnerId: () => {
    console.log(" Calling boarding house API...");
    console.log("🔑 Current token:", authService.getToken() ? "Present" : "Missing");
    console.log("👤 User info:", authService.getUserInfo());

    // The backend endpoint /owner extracts ownerId from JWT token automatically
    return api.get('/api/BoardingHouses/owner');
  },
  // Create with FormData (supports multiple image upload)
  create: (formData) => api.postFormData('/api/BoardingHouses', formData),
  // Update with FormData (backend uses [FromForm] - expects ImageUrls as array of strings)
  update: (id, formData) => api.putFormData(`/api/BoardingHouses/${id}`, formData),
  delete: (id) => api.delete(`/api/BoardingHouses/${id}`),

  // Ranking & Analytics APIs
  // Get ranked boarding houses by Rating or Sentiment (using Python ML)
  // @param type: "Rating" or "Sentiment"
  // @param order: "desc" or "asc" (default: "desc")
  // @param limit: number of results (default: 10)
  getRanked: (type, order = 'desc', limit = 10) => {
    const params = new URLSearchParams({ type, order, limit: limit.toString() });
    return api.get(`/api/BoardingHouses/rank?${params.toString()}`);
  },

  // Get rating summary for a boarding house (star distribution + reviews)
  getRatingSummary: (id) => api.get(`/api/BoardingHouses/${id}/rating-feedback`),

  // Get sentiment summary for a boarding house (positive/neutral/negative analysis using Python ML)
  getSentimentSummary: (id) => api.get(`/api/BoardingHouses/${id}/sentiment-feedback`),

  // Get owner occupancy rate statistics
  getOwnerOccupancyRate: () => api.get('/api/BoardingHouses/owner/occupancy-rate')
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
  getByBoardingHouseId: (houseId) => api.get(`/api/Rooms/house/${houseId}`),
  getByHouseId: (houseId) => api.get(`/api/Rooms/house/${houseId}/Status`), // Alias for compatibility

  // JSON create method (legacy, no image)
  create: (houseId, data) => {
    return api.post(`/api/Rooms/House/${houseId}`, data);
  },

  // FormData create method (with image upload to Filebase IPFS)
  createWithFormData: (houseId, formData) => {
    return api.postFormData(`/api/Rooms/House/${houseId}`, formData);
  },

  // JSON update method (legacy, no image)
  update: (id, data) => api.put(`/api/Rooms/${id}`, data),

  // FormData update method (with optional image upload to Filebase IPFS)
  updateWithFormData: (id, formData) => {
    return api.putFormData(`/api/Rooms/${id}`, formData);
  },

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

// Payment API
// Helper function to get auth token for payment API
const getPaymentAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken') ||
      localStorage.getItem('ezstay_token') ||
      localStorage.getItem('token');
  }
  return null;
};

// Payment API - uses external payment service
export const paymentAPI = {
  // Bank Account Management - using external API
  getAllBankAccounts: async (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);
    if (odataParams.$count !== undefined) queryParams.append('$count', odataParams.$count);

    const queryString = queryParams.toString();
    // Use all-by-user endpoint to get bank accounts for current user
    const endpoint = queryString
      ? `https://payment-api-r4zy.onrender.com/api/Bank/bank-account/by-user?${queryString}`
      : 'https://payment-api-r4zy.onrender.com/api/Bank/bank-account/by-user';

    const token = getPaymentAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('📥 Fetching bank accounts from:', endpoint);
    console.log('🔑 Using token:', token ? 'Present' : 'Missing');
    const response = await fetch(endpoint, { method: 'GET', headers });
    console.log('📊 Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error fetching bank accounts:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Bank accounts loaded:', data);
    return data;
  },

  getBankAccountById: async (id) => {
    const token = getPaymentAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`https://payment-api-r4zy.onrender.com/api/Bank/bank-account/${id}`, {
      method: 'GET',
      headers
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  createBankAccount: async (data) => {
    const token = getPaymentAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('https://payment-api-r4zy.onrender.com/api/Bank/bank-account', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      // Backend returns error message as plain text or JSON
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.Message || errorJson || errorMessage;
      } catch {
        // If not JSON, use plain text
        if (errorText) errorMessage = errorText;
      }
      console.error('❌ Create bank account error:', errorMessage);
      throw new Error(errorMessage);
    }
    return response.json();
  },

  updateBankAccount: async (id, data) => {
    const token = getPaymentAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`https://payment-api-r4zy.onrender.com/api/Bank/bank-account/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      // Backend returns error message as plain text or JSON
      const errorText = await response.text();
      console.log('❌ Error response text:', errorText);
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          console.log('❌ Error JSON:', errorJson);

          // Handle ApiResponse format from backend
          if (errorJson.success === false && errorJson.message) {
            errorMessage = errorJson.message;
          }
          // Handle Problem Details format (RFC 7807)
          else if (errorJson.errors) {
            // Get first error message from errors object
            const firstErrorKey = Object.keys(errorJson.errors)[0];
            if (firstErrorKey && Array.isArray(errorJson.errors[firstErrorKey])) {
              errorMessage = errorJson.errors[firstErrorKey][0];
            } else if (firstErrorKey) {
              errorMessage = errorJson.errors[firstErrorKey];
            }
          } else {
            // Try multiple possible error message fields
            errorMessage = errorJson.message
              || errorJson.Message
              || errorJson.detail
              || errorJson.Detail
              || errorJson.error
              || errorJson.Error
              || (errorJson.title !== 'Bad Request' ? errorJson.title : null)
              || (typeof errorJson === 'string' ? errorJson : null)
              || errorMessage;
          }
        } catch {
          // If not JSON, use plain text directly
          errorMessage = errorText;
        }
      }

      console.error('❌ Update bank account error:', errorMessage);
      throw new Error(errorMessage);
    }
    // Handle empty or non-JSON response
    const text = await response.text();
    if (!text) return { success: true };
    try {
      return JSON.parse(text);
    } catch {
      return { success: true, message: text };
    }
  },

  deleteBankAccount: async (id) => {
    const token = getPaymentAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`https://payment-api-r4zy.onrender.com/api/Bank/bank-account/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Transactions
  getTransactions: () => api.get('/api/BankAccount/transactions')
};

// Support API
export const supportAPI = {
  // Get all support tickets (Staff only)
  getAll: () => api.get('/api/Support'),

  // Create support ticket
  create: (data) => api.post('/api/Support', data),

  // Update support ticket status (Staff only)
  updateStatus: (id, data) => api.put(`/api/Support/${id}/status`, data)
};

// Review API
export const reviewAPI = {
  // Review Management
  getAllReviews: (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);
    if (odataParams.$count !== undefined) queryParams.append('$count', odataParams.$count);
    if (odataParams.$expand) queryParams.append('$expand', odataParams.$expand);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/Review?${queryString}` : '/api/Review';

    return api.get(endpoint);
  },
  getReviewById: (id) => api.get(`/api/Review/${id}`),
  createReview: (contractId, formData) => api.postFormData(`/api/Review/${contractId}`, formData),
  updateReview: (id, formData) => api.putFormData(`/api/Review/${id}`, formData),
  deleteReview: (id) => api.delete(`/api/Review/${id}`),

  // Review Reply Management
  getAllReviewReplies: (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/ReviewReply?${queryString}` : '/api/ReviewReply';

    return api.get(endpoint);
  },
  getReviewReplyById: (id) => api.get(`/api/ReviewReply/${id}`),
  getReplyByReviewId: (reviewId) => api.get(`/api/ReviewReply/review/${reviewId}`),
  createReviewReply: (reviewId, formData) => api.postFormData(`/api/ReviewReply/${reviewId}`, formData),
  updateReviewReply: (id, formData) => api.putFormData(`/api/ReviewReply/${id}`, formData),
  deleteReviewReply: (id) => api.delete(`/api/ReviewReply/${id}`),

  // Review Report Management
  getAllReviewReports: (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/ReviewReport?${queryString}` : '/api/ReviewReport';

    return api.get(endpoint);
  },
  getReviewReportById: (reviewId) => api.get(`/api/ReviewReport/${reviewId}`),
  createReviewReport: (reviewId, formData) => api.postFormData(`/api/ReviewReport/${reviewId}`, formData),
  updateReviewReport: (reviewId, formData) => api.putFormData(`/api/ReviewReport/${reviewId}`, formData),
  updateReviewReportStatus: (reportId, data) => api.put(`/api/ReviewReport/status/${reportId}`, data)
};

// Utility Bill API
export const utilityBillAPI = {
  // Get bills for tenant (Guest User)
  getTenantBills: (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);
    if (odataParams.$count !== undefined) queryParams.append('$count', odataParams.$count);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/UtilityBills/tenant?${queryString}` : '/api/UtilityBills/tenant';

    return api.get(endpoint);
  },

  // Get bills for owner
  getOwnerBills: (odataParams = {}) => {
    const queryParams = new URLSearchParams();

    if (odataParams.$filter) queryParams.append('$filter', odataParams.$filter);
    if (odataParams.$orderby) queryParams.append('$orderby', odataParams.$orderby);
    if (odataParams.$top) queryParams.append('$top', odataParams.$top);
    if (odataParams.$skip) queryParams.append('$skip', odataParams.$skip);
    if (odataParams.$count !== undefined) queryParams.append('$count', odataParams.$count);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/UtilityBills/owner?${queryString}` : '/api/UtilityBills/owner';

    return api.get(endpoint);
  },

  // Get bill by ID
  getBillById: (billId) => api.get(`/api/UtilityBills/${billId}`),

  // Generate bill for room (Owner only)
  generateBill: (roomId, tenantId = null) => {
    const endpoint = tenantId
      ? `/api/UtilityBills/generate/${roomId}?tenantId=${tenantId}`
      : `/api/UtilityBills/generate/${roomId}`;
    return api.post(endpoint, {});
  },

  // Update bill (Owner only)
  updateBill: (billId, formData) => api.putFormData(`/api/UtilityBills/${billId}`, formData),

  // Mark bill as paid
  markAsPaid: (billId, paymentMethod) =>
    api.put(`/api/UtilityBills/${billId}/pay`, { paymentMethod }),

  // Cancel bill (Owner only)
  cancelBill: (billId, cancelNote) =>
    api.put(`/api/UtilityBills/${billId}/cancel`, { cancelNote })
};

export default api;
