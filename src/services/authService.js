// Authentication Service for EZStay
class AuthService {
  constructor() {
    this.apiUrl = "http://localhost:7001/api/Auth";
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
          success: data.success || true,
          message: data.message || "Registration successful! Please check your email for OTP.",
        };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed. Please try again.",
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
          success: data.success || true,
          message: data.message || "Email verified successfully!",
        };
      } else {
        return {
          success: false,
          message: data.message || "Invalid OTP. Please try again.",
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

  // Resend OTP
  async resendOtp(email) {
    try {
      console.log("🔄 Resending OTP to:", email);
      
      const response = await fetch(`${this.apiUrl}/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email }),
      });

      const data = await response.json();
      console.log("📥 Resend OTP response:", data);
      
      if (response.ok) {
        return {
          success: data.success || true,
          message: data.message || "OTP resent successfully!",
        };
      } else {
        return {
          success: false,
          message: data.message || "Failed to resend OTP. Please try again.",
        };
      }
    } catch (error) {
      console.error("💥 Resend OTP error:", error);
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
      
      // Use lowercase 'success' and 'token' from backend response
      if (response.ok && (data.success || data.token)) {
        // Store auth token
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userEmail", credentials.email);
        }
        
        return {
          success: true,
          message: data.message || "Login successful!",
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.message || "Login failed. Please check your credentials.",
        };
      }
    } catch (error) {
      console.error("💥 Login error:", error);
      return {
        success: false,
        message: "Network error. Please try again.",
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

  // Get user info from token
  getUserInfo() {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // .NET Core uses a long schema for the email claim in JWT. We check for both that and the simple 'email'.
      const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      // .NET Core uses a long schema for the role claim in JWT. We check for both that and the simple 'role'.
      const role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      return { ...payload, email, role };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Create Staff Account
  async createStaff(staffData) {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: "No authentication token found." };
      }

      const response = await fetch(`${this.apiUrl}/create-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          FullName: staffData.fullName,
          Email: staffData.email,
          Phone: staffData.phone,
          Password: staffData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message || "Staff account created successfully." };
      } else {
        return { success: false, message: data.message || "Failed to create staff account." };
      }
    } catch (error) {
      console.error("💥 Create staff error:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
