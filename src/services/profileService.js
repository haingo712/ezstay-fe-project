// src/services/profileService.js
import api from "@/utils/api";
import imageService from "./imageService";

class ProfileService {
  constructor() {
    this.baseUrl = "/api/User";
    this.imageUrl = "/api/Images";
  }

  // Upload avatar image và trả về URL
  async uploadAvatar(avatarFile) {
    try {
      console.log("� Uploading avatar via imageService...");
      return await imageService.upload(avatarFile);
    } catch (error) {
      console.error("❌ Error uploading avatar:", error);
      throw error;
    }
  }

  // Tạo profile mới (UserDTO)
  async createProfile(profileData) {
    try {
      console.log("👤 Creating new profile...", profileData);
      
      const createData = {
        Gender: this.getGenderEnum(profileData.gender || "Male"),
        Avata: profileData.avata || null, // Use null instead of empty string
        Bio: profileData.bio || null,
        Province: profileData.province || null, // Use null instead of empty string
        Commune: profileData.commune || null,   
        DetailAddress: profileData.detailAddress || null
      };
      
      console.log("📤 Sending to backend:", createData);
      console.log("🔢 Gender enum value:", createData.Gender);
      console.log("📸 Avatar value:", createData.Avata);
      
      const response = await api.post(`${this.baseUrl}/create-profile`, createData);
      console.log("✅ Profile created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      throw error;
    }
  }

  // Lấy profile của user hiện tại  
  // Note: Profile có thể chưa tồn tại, trả về null nếu 404
  async getProfile() {
    try {
      console.log("👤 Fetching user profile...");
      const response = await api.get(`${this.baseUrl}/profile`);
      console.log("✅ Profile fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("📝 Profile not found (404) - User needs to create profile first.");
        return null; // Gracefully handle no profile
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
      
      // Don't throw error - let frontend handle gracefully
      return null;
    }
  }

  // Cập nhật profile với FormData (UpdateUserDTO)
  async updateProfile(profileData) {
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
      if (profileData.avatar && profileData.avatar.trim()) {
        formData.append('Avatar', profileData.avatar.trim());
      }
      if (profileData.detailAddress && profileData.detailAddress.trim()) {
        formData.append('DetailAddress', profileData.detailAddress.trim());
      }
      // Backend UpdateUserDTO uses ProvinceId/CommuneId (not Code)
      if (profileData.provinceId && profileData.provinceId.trim()) {
        formData.append('ProvinceId', profileData.provinceId.trim());
      }
      if (profileData.communeId && profileData.communeId.trim()) {
        formData.append('CommuneId', profileData.communeId.trim());
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
