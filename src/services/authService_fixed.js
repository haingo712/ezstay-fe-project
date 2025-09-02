// Authentication Service for EZStay
class AuthService {
  constructor() {
    this.apiUrl = "http://localhost:7000/api/Auth";
  }

  // Register new user
  async register(userData) {
    try {
      console.log("🚀 Registering user with:", userData);
      
      const response = await fetch(`${this.apiUrl}/register`, {
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

      const data = await response.json();
      console.log("📥 Registration response:", data);
      
      if (response.ok) {
        return {
          success: data.Success || true,
          message: data.Message || "Registration successful! Please check your email for OTP.",
        };
      } else {
        return {
          success: false,
          message: data.Message || "Registration failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
      return {
        success: false,
        message: "Network error. Please check if backend is running.",
      };
    }
  }

  // Verify OTP for registration
  async verifyOtp(email, otp) {
    try {
      console.log("🔐 Verifying OTP for:", email);
      
      const response = await fetch(`${this.apiUrl}/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          Otp: otp,
        }),
      });

      const data = await response.json();
      console.log("📥 OTP verification response:", data);
      
      if (response.ok) {
        return {
          success: data.Success || true,
          message: data.Message || "Email verified successfully!",
        };
      } else {
        return {
          success: false,
          message: data.Message || "Invalid OTP. Please try again.",
        };
      }
    } catch (error) {
      console.error("💥 OTP verification error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Login user (with email or phone)
  async login(credentials) {
    try {
      console.log("🔑 Logging in user with:", credentials.email);
      
      const response = await fetch(`${this.apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: credentials.email, // Can be email or phone number
          Password: credentials.password,
        }),
      });

      const data = await response.json();
      console.log("📥 Login response:", data);
      
      if (response.ok && (data.Success || data.Token)) {
        // Store auth token
        if (data.Token) {
          localStorage.setItem("authToken", data.Token);
          localStorage.setItem("userEmail", credentials.email);
        }
        
        return {
          Success: true,
          Message: data.Message || "Login successful!",
          Token: data.Token,
        };
      } else {
        return {
          Success: false,
          Message: data.Message || "Login failed. Please check your credentials.",
        };
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      return {
        Success: false,
        Message: "Network error. Please try again.",
      };
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
  }

  // Get stored auth token
  getToken() {
    return localStorage.getItem("authToken");
  }

  // Get stored user email
  getUserEmail() {
    return localStorage.getItem("userEmail");
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
