// Authentication Service - Clean version
const API_URL = "http://localhost:7001/api/Auth";

class AuthService {
  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FullName: userData.fullName,
          Email: userData.email,
          Phone: userData.phone,
          Password: userData.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: data.Success || data.success,
        message: data.Message || data.message,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "Network error. Please check if backend is running.",
      };
    }
  }

  // Verify OTP
  async verifyOtp(email, otp) {
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Otp: otp,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: data.Success || data.success,
        message: data.Message || data.message,
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        message: error.message || "Network error. Please try again.",
      };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: credentials.email, // Can be email or phone
          Password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.Success || data.success) {
        // Store token if login successful
        if (data.Token || data.token) {
          localStorage.setItem("authToken", data.Token || data.token);
        }
      }

      return {
        Success: data.Success || data.success,
        Message: data.Message || data.message,
        Token: data.Token || data.token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        Success: false,
        Message: error.message || "Network error. Please try again.",
      };
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem("authToken");
  }

  // Get auth token
  getToken() {
    return localStorage.getItem("authToken");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
