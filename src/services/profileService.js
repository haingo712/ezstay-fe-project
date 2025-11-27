// src/services/profileService.js
import api from "@/utils/api";
import imageService from "./imageService";

class ProfileService {
  constructor() {
    this.baseUrl = "/api/Profile";
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

  // Tạo profile mới (UserDTO) - Chỉ User role
  async createProfile(profileData) {
    try {
      console.log("👤 Creating new profile...", profileData);
      
      // Create FormData for [FromForm] UserDTO with IFormFile Avatar
      const formData = new FormData();
      
      formData.append('Gender', this.getGenderEnum(profileData.gender || "Male"));
      
      // Avatar: IFormFile (required in backend)
      if (profileData.avatar instanceof File) {
        formData.append('Avatar', profileData.avatar);
        console.log("📸 Avatar file added:", profileData.avatar.name);
      } else {
        console.warn("⚠️ No avatar file provided for create");
      }
      
      formData.append('Bio', profileData.bio || "");
      
      if (profileData.dateOfBirth) {
        const date = new Date(profileData.dateOfBirth);
        formData.append('DateOfBirth', date.toISOString());
      }
      
      if (profileData.detailAddress) {
        formData.append('DetailAddress', profileData.detailAddress);
      }
      
      if (profileData.provinceId) {
        formData.append('ProvinceId', profileData.provinceId);
      }
      
      if (profileData.wardId) {
        formData.append('WardId', profileData.wardId);
      }
      
      // CCCD fields (optional)
      // ONLY send File objects, NOT string URLs
      if (profileData.frontImageUrl) {
        if (profileData.frontImageUrl instanceof File) {
          formData.append('FrontImageUrl', profileData.frontImageUrl);
          console.log('📤 Uploading front CCCD image file:', profileData.frontImageUrl.name);
        } else {
          console.log('⚠️ FrontImageUrl is not a File object, skipping');
        }
      }
      if (profileData.backImageUrl) {
        if (profileData.backImageUrl instanceof File) {
          formData.append('BackImageUrl', profileData.backImageUrl);
          console.log('📤 Uploading back CCCD image file:', profileData.backImageUrl.name);
        } else {
          console.log('⚠️ BackImageUrl is not a File object, skipping');
        }
      }
      if (profileData.temporaryResidence) {
        formData.append('TemporaryResidence', profileData.temporaryResidence);
      }
      if (profileData.citizenIdNumber) {
        formData.append('CitizenIdNumber', profileData.citizenIdNumber);
      }
      if (profileData.citizenIdIssuedDate) {
        const date = new Date(profileData.citizenIdIssuedDate);
        formData.append('CitizenIdIssuedDate', date.toISOString());
      }
      if (profileData.citizenIdIssuedPlace) {
        formData.append('CitizenIdIssuedPlace', profileData.citizenIdIssuedPlace);
      }
      
      console.log("📤 FormData being sent to backend (create-profile):");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? value.name : value}`);
      }
      
      // Use postFormData for FormData, not post (which would stringify it)
      const response = await api.postFormData(`${this.baseUrl}/create-profile`, formData);
      console.log("✅ Profile created successfully:", response);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating profile:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.response?.data?.message || error.message);
      
      // Throw detailed error for UI display
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.title ||
                          error.response?.data ||
                          error.message ||
                          "Failed to create profile";
      throw new Error(errorMessage);
    }
  }

  // Lấy profile của user hiện tại  
  // Note: Profile có thể chưa tồn tại, trả về null nếu 404
  async getProfile() {
    try {
      console.log("👤 Fetching user profile...");
      const data = await api.get(`${this.baseUrl}/profile`);
      console.log("✅ Profile fetched successfully:", data);
      return data; // api.get() already returns parsed JSON data directly
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

  // Cập nhật profile với FormData (UpdateUserDTO) - Tất cả roles
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
      if (profileData.bio !== undefined && profileData.bio !== null) {
        formData.append('Bio', profileData.bio);
      }
      if (profileData.dateOfBirth) {
        // Backend expects DateTime format, ensure proper format
        const date = new Date(profileData.dateOfBirth);
        console.log("📅 Date conversion:", profileData.dateOfBirth, "→", date.toISOString());
        formData.append('DateOfBirth', date.toISOString());
      }
      if (profileData.fullName) {
        formData.append('FullName', profileData.fullName);
      }
      // Avatar field - ONLY send if it's a File object (new upload)
      // If not sent (null/undefined) - backend will keep existing avatar
      if (profileData.avatar !== undefined && profileData.avatar !== null) {
        if (profileData.avatar instanceof File) {
          // New file upload
          formData.append('Avatar', profileData.avatar);
          console.log('📤 Uploading new avatar file:', profileData.avatar.name);
        } else {
          // Not a File - don't send to FormData
          console.log('ℹ️ Avatar is not a File object - backend will keep existing');
        }
      }
      if (profileData.detailAddress !== undefined && profileData.detailAddress !== null) {
        formData.append('DetailAddress', profileData.detailAddress);
      }
      // Backend UpdateUserDTO uses ProvinceId/WardId
      if (profileData.provinceId) {
        formData.append('ProvinceId', profileData.provinceId);
      }
      if (profileData.wardId) {
        formData.append('WardId', profileData.wardId); // Backend uses WardId
      }
      
      // CCCD fields (optional)
      // ONLY send if it's a File object (new upload)
      // If string URL - DON'T send, backend will keep existing image
      if (profileData.frontImageUrl !== undefined && profileData.frontImageUrl !== null) {
        if (profileData.frontImageUrl instanceof File) {
          formData.append('FrontImageUrl', profileData.frontImageUrl);
          console.log('📤 Uploading new front CCCD image file:', profileData.frontImageUrl.name);
        } else if (typeof profileData.frontImageUrl === 'string') {
          // String URL - DON'T send to FormData (backend expects IFormFile only)
          // Backend will keep existing URL if field is not sent
          console.log('ℹ️ Keeping existing front CCCD image (not sending URL string)');
        }
      }
      if (profileData.backImageUrl !== undefined && profileData.backImageUrl !== null) {
        if (profileData.backImageUrl instanceof File) {
          formData.append('BackImageUrl', profileData.backImageUrl);
          console.log('📤 Uploading new back CCCD image file:', profileData.backImageUrl.name);
        } else if (typeof profileData.backImageUrl === 'string') {
          // String URL - DON'T send to FormData (backend expects IFormFile only)
          // Backend will keep existing URL if field is not sent
          console.log('ℹ️ Keeping existing back CCCD image (not sending URL string)');
        }
      }
      if (profileData.temporaryResidence !== undefined && profileData.temporaryResidence !== null) {
        formData.append('TemporaryResidence', profileData.temporaryResidence);
      }
      if (profileData.citizenIdNumber !== undefined && profileData.citizenIdNumber !== null) {
        formData.append('CitizenIdNumber', profileData.citizenIdNumber);
      }
      if (profileData.citizenIdIssuedDate) {
        const date = new Date(profileData.citizenIdIssuedDate);
        formData.append('CitizenIdIssuedDate', date.toISOString());
      }
      if (profileData.citizenIdIssuedPlace !== undefined && profileData.citizenIdIssuedPlace !== null) {
        formData.append('CitizenIdIssuedPlace', profileData.citizenIdIssuedPlace);
      }
      
      console.log("📤 FormData being sent to backend:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Use putFormData for FormData, not put (which would stringify it)
      const response = await api.putFormData(`${this.baseUrl}/update-profile`, formData);
      console.log("✅ Profile updated successfully:", response);
      return response.data;
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
