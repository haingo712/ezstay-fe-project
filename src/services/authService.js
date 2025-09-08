// Authentication Service for EZStay
class AuthService {
  constructor() {
    this.apiUrl = "https://localhost:7000/api/Auth";
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
          console.log("💾 Storing new auth token...");
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userEmail", credentials.email);
          
          // Add small delay to ensure localStorage is updated
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // After successful login, get user info
        const user = this.getUserInfo();
        console.log("✅ Login successful, user info:", user);

        return {
          success: true,
          message: data.message || "Login successful!",
          token: data.token,
          user: user, // Return user object
        };
      } else {
        console.log("❌ Login failed:", data.message);
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
    console.log("🚪 AuthService: Starting logout process...");
    
    // Method 1: Clear specific auth-related items
    const keysToRemove = [
      "authToken", 
      "userEmail", 
      "userRole", 
      "userId", 
      "user",
      "auth_token", // Alternative naming
      "token"       // Alternative naming
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Method 2: Scan and remove any keys that might contain auth data
    const allKeys = Object.keys(localStorage);
    console.log("🔍 All localStorage keys before cleanup:", allKeys);
    
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('user')) {
        console.log(`🗑️ Removing additional auth key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Method 3: Nuclear option - clear everything if needed
    const remainingKeys = Object.keys(localStorage);
    if (remainingKeys.length > 0) {
      console.log("⚠️ Still have remaining keys, clearing all localStorage:", remainingKeys);
      localStorage.clear();
    }
    
    console.log("✅ AuthService: Logout completed, localStorage cleared");
    console.log("🔍 Remaining localStorage keys:", Object.keys(localStorage));
  }

  // Get stored auth token
  getToken() {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("🔐 Retrieved token from localStorage:", token.substring(0, 20) + "...");
      
      // Decode and log token payload for debugging
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("🔍 Token payload:", payload);
      } catch (e) {
        console.error("❌ Error decoding token:", e);
      }
    } else {
      console.log("❌ No token found in localStorage");
    }
    return token;
  }

  // Get stored user email
  getUserEmail() {
    return localStorage.getItem("userEmail");
  }

  // Get user info from token
  getUserInfo() {
    const token = this.getToken();
    if (!token) {
      console.log("❌ No token available for getUserInfo");
      return null;
    }
    
    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.log("⏰ Token expired, clearing localStorage");
        this.logout();
        return null;
      }
      
      // .NET Core uses a long schema for the email claim in JWT. We check for both that and the simple 'email'.
      const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      // .NET Core uses a long schema for the role claim in JWT. We check for both that and the simple 'role'.
      let role = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      // Get user ID from various possible claim names
      const id = payload.id || 
                 payload.sub || 
                 payload.userId || 
                 payload.nameid || 
                 payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      
      console.log("🔍 JWT Payload:", payload);
      console.log("🔍 Raw role from token:", role, `(Type: ${typeof role})`);
      console.log("🔍 User ID from token:", id);
      console.log("🔍 All possible role fields:", {
        'role': payload.role,
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        'Role': payload.Role,
        'userRole': payload.userRole
      });
      
      // Convert role to number for consistent checking
      if (role) {
        if (typeof role === 'string') {
          // Handle role names (Staff, Admin, Owner, etc.)
          switch (role.toLowerCase()) {
            case 'owner':
              role = 2;
              break;
            case 'staff':
              role = 3;
              break;
            case 'admin':
              role = 4;
              break;
            default:
              // Try to parse as number if it's a numeric string
              const parsedRole = parseInt(role, 10);
              role = isNaN(parsedRole) ? role : parsedRole;
          }
        }
      } else {
        // If no role found, try other possible field names
        role = payload.Role || payload.userRole || payload['Role'];
        if (role && typeof role === 'string') {
          switch (role.toLowerCase()) {
            case 'owner':
              role = 2;
              break;
            case 'staff':
              role = 3;
              break;
            case 'admin':
              role = 4;
              break;
            default:
              const parsedRole = parseInt(role, 10);
              role = isNaN(parsedRole) ? role : parsedRole;
          }
        }
      }

      console.log("🔍 Final role:", role, `(Type: ${typeof role})`);
      
      const userInfo = { ...payload, email, role, id };
      console.log("🔍 Final user object:", userInfo);
      
      // Validate that we have essential info
      if (!email || !role) {
        console.warn("⚠️ Token missing essential info - email or role");
        return null;
      }
      
      return userInfo;
    } catch (error) {
      console.error("Error decoding token:", error);
      // Clear invalid token
      this.logout();
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
