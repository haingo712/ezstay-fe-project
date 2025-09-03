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
  };

  try {
  // Only log request details for non-404 attempts to reduce console noise
  if (!url.includes('UtilityRate') || !config.skipLogging) {
    console.log("🌐 API Request:", {
      url,
      method: config.method || 'GET',
      headers: config.headers
    });
  }

  const response = await fetch(url, config);

  // Log response details, but reduce noise for 404s during endpoint discovery
  if (response.status === 404 && url.includes('UtilityRate')) {
    // Silent 404 for utility rate endpoint discovery
  } else {
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

export default api;
