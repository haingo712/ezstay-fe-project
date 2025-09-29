// src/services/profileService.js
import api from "@/utils/api";

class ProfileService {
  constructor() {
    this.baseUrl = "/api/User";
  }

  // Lấy profile của user hiện tại
  // Note: Backend tự động tạo profile rỗng khi user đăng ký
  async getProfile() {
    try {
      console.log("👤 Fetching user profile...");
      const response = await api.get(`${this.baseUrl}/profile`);
      console.log("✅ Profile fetched successfully:", response);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("📝 Profile not found (404) - this should not happen as backend auto-creates profiles.");
        return null; 
      }
      if (error.response && error.response.status === 401) {
        console.log("🔐 Profile fetch failed due to authentication (401).");
        return null;
      }
      console.error("❌ Error fetching profile:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method
      });
      throw error;
    }
  }

  // Cập nhật profile với FormData (khớp với UpdateUserDTO backend)
  // Note: Backend tự động tạo profile rỗng khi user đăng ký, frontend chỉ cần update
  async updateProfile(profileData, avatarFile = null) {
    try {
      console.log("👤 Updating profile...", profileData);
      
      // Create FormData for [FromForm] UpdateUserDTO
      const formData = new FormData();
      
      // Add fields that have actual values (not empty strings)
      if (profileData.gender !== undefined) {
        const genderEnum = this.getGenderEnum(profileData.gender);
        formData.append('Gender', genderEnum);
      }
      if (profileData.bio && profileData.bio.trim()) {
        formData.append('Bio', profileData.bio.trim());
      }
      if (profileData.dateOfBirth) {
        // Backend expects DateTime format, ensure proper format
        const date = new Date(profileData.dateOfBirth);
        console.log("📅 Date conversion:", profileData.dateOfBirth, "→", date.toISOString());
        formData.append('DateOfBirth', date.toISOString());
      }
      if (profileData.fullName && profileData.fullName.trim()) {
        formData.append('FullName', profileData.fullName.trim());
      }
      if (profileData.phone && profileData.phone.trim()) {
        formData.append('Phone', profileData.phone.trim());
      }
      // Add address fields (backend expects ID but stores name in User model)
      if (profileData.provinceId && profileData.provinceId.trim()) {
        formData.append('ProvinceId', profileData.provinceId.trim());
      }
      if (profileData.communeId && profileData.communeId.trim()) {
        formData.append('CommuneId', profileData.communeId.trim());
      }
      // Note: Backend UpdateUserDTO uses ProvinceId/CommuneId but 
      // User model stores Province/Commune (names). Backend service should handle conversion.
      
      // Add avatar file if provided (IFormFile Avatar)
      if (avatarFile) {
        formData.append('Avatar', avatarFile);
      }
      
      console.log("📤 FormData being sent to backend:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Don't set Content-Type manually for FormData - browser will set it with boundary
      const response = await api.put(`${this.baseUrl}/update-profile`, formData);
      console.log("✅ Profile updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      throw error;
    }
  }

  // Cập nhật số điện thoại với OTP
  async updatePhone(phone, otp) {
    try {
      console.log("📱 Updating phone with OTP...");
      const response = await api.put(`${this.baseUrl}/update-phone`, {
        Phone: phone,
        Otp: otp
      });
      console.log("✅ Phone updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating phone:", error);
      throw error;
    }
  }

  // Cập nhật email với OTP
  async updateEmail(newEmail, otp) {
    try {
      console.log("📧 Updating email with OTP...");
      const response = await api.put(`${this.baseUrl}/update-email`, {
        NewEmail: newEmail,
        Otp: otp
      });
      console.log("✅ Email updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating email:", error);
      throw error;
    }
  }

  // Helper: Map gender enum to display text
  getGenderText(genderEnum) {
    switch (genderEnum) {
      case 1:
        return "Male";
      case 2:
        return "Female";
      case 3:
        return "Other";
      default:
        return "Male";
    }
  }

  // Helper: Map gender text to enum
  getGenderEnum(genderText) {
    console.log("🔄 Converting gender text to enum:", genderText, typeof genderText);
    
    // Ensure genderText is a string and handle null/undefined
    if (!genderText || typeof genderText !== 'string') {
      console.log("⚠️ Invalid gender text, defaulting to Male (1)");
      return 1; // default to male
    }
    
    const result = (() => {
      switch (genderText.toLowerCase()) {
        case "male":
          return 1;
        case "female":
          return 2;
        case "other":
          return 3;
        default:
          return 1; // default to male
      }
    })();
    
    console.log("✅ Gender conversion result:", genderText, "→", result);
    return result;
  }
}

const profileService = new ProfileService();
export default profileService;
