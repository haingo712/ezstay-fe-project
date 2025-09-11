// src/services/profileService.js
import api from "@/utils/api";

class ProfileService {
  constructor() {
    this.baseUrl = "/api/User";
  }

  // Lấy profile của user hiện tại
  async getProfile() {
    try {
      console.log("👤 Fetching user profile...");
      const response = await api.get(`${this.baseUrl}/profile`);
      console.log("✅ Profile fetched successfully:", response);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Profile not found (404), returning null as it likely hasn't been created yet.");
        return null; // Return null if profile does not exist
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

  // Tạo profile mới
  async createProfile(profileData) {
    try {
      console.log("👤 Creating profile...", profileData);
      const response = await api.post(`${this.baseUrl}/create-profile`, profileData);
      console.log("✅ Profile created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      throw error;
    }
  }

  // Cập nhật profile
  async updateProfile(profileData) {
    try {
      console.log("👤 Updating profile...", profileData);
      const response = await api.put(`${this.baseUrl}/update-profile`, profileData);
      console.log("✅ Profile updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
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
        return "Not specified";
    }
  }

  // Helper: Map gender text to enum
  getGenderEnum(genderText) {
    switch (genderText?.toLowerCase()) {
      case "male":
        return 1;
      case "female":
        return 2;
      case "other":
        return 3;
      default:
        return 1; // default to male
    }
  }
}

const profileService = new ProfileService();
export default profileService;
