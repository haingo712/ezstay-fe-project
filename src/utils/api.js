// src/utils/api.js - API Configuration for MongoDB & ASP.NET Microservices

// Main API URLs for different microservices
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const AUTH_API =
  process.env.NEXT_PUBLIC_AUTH_API || "http://localhost:5001";
export const PROPERTY_API =
  process.env.NEXT_PUBLIC_PROPERTY_API || "http://localhost:5002";
export const PAYMENT_API =
  process.env.NEXT_PUBLIC_PAYMENT_API || "http://localhost:5003";
export const NOTIFICATION_API =
  process.env.NEXT_PUBLIC_NOTIFICATION_API || "http://localhost:5004";

// Helper function for API calls
export async function apiFetch(path, options = {}) {
  // Determine which API to use based on the path
  let baseUrl = API_URL;

  if (path.startsWith("/auth/")) {
    baseUrl = AUTH_API;
  } else if (
    path.startsWith("/properties/") ||
    path.startsWith("/rooms/") ||
    path.startsWith("/posts/")
  ) {
    baseUrl = PROPERTY_API;
  } else if (path.startsWith("/payments/") || path.startsWith("/bills/")) {
    baseUrl = PAYMENT_API;
  } else if (path.startsWith("/notifications/")) {
    baseUrl = NOTIFICATION_API;
  }

  if (!baseUrl) {
    throw new Error("API URL is not configured for: " + path);
  }

  const url = `${baseUrl}/api${path}`;

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

// Authentication helpers
export const authAPI = {
  login: (credentials) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () =>
    apiFetch("/auth/logout", {
      method: "POST",
    }),

  refreshToken: () =>
    apiFetch("/auth/refresh", {
      method: "POST",
    }),

  getProfile: () => apiFetch("/auth/profile"),
};

// Property/Room helpers
export const propertyAPI = {
  getRooms: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/rooms${queryString ? `?${queryString}` : ""}`);
  },

  getRoom: (id) => apiFetch(`/rooms/${id}`),

  createRoom: (roomData) =>
    apiFetch("/rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    }),

  updateRoom: (id, roomData) =>
    apiFetch(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(roomData),
    }),

  deleteRoom: (id) =>
    apiFetch(`/rooms/${id}`, {
      method: "DELETE",
    }),

  getPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/posts${queryString ? `?${queryString}` : ""}`);
  },

  createPost: (postData) =>
    apiFetch("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    }),
};

// Payment helpers
export const paymentAPI = {
  getBills: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/bills${queryString ? `?${queryString}` : ""}`);
  },

  createBill: (billData) =>
    apiFetch("/bills", {
      method: "POST",
      body: JSON.stringify(billData),
    }),

  payBill: (billId, paymentData) =>
    apiFetch(`/bills/${billId}/pay`, {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
};

// Notification helpers
export const notificationAPI = {
  getNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/notifications${queryString ? `?${queryString}` : ""}`);
  },

  markAsRead: (notificationId) =>
    apiFetch(`/notifications/${notificationId}/read`, {
      method: "PUT",
    }),

  sendNotification: (notificationData) =>
    apiFetch("/notifications", {
      method: "POST",
      body: JSON.stringify(notificationData),
    }),
};

// Utility function to check if APIs are available
export const checkAPIHealth = async () => {
  const apis = {
    main: API_URL,
    auth: AUTH_API,
    property: PROPERTY_API,
    payment: PAYMENT_API,
    notification: NOTIFICATION_API,
  };

  const healthChecks = {};

  for (const [name, url] of Object.entries(apis)) {
    try {
      const response = await fetch(`${url}/health`, { method: "GET" });
      healthChecks[name] = response.ok;
    } catch {
      healthChecks[name] = false;
    }
  }

  return healthChecks;
};

export default apiFetch;
