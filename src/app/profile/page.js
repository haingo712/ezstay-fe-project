"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import AddressSelector from "@/components/AddressSelector";
import FaceRegistrationModal from "@/components/FaceRegistrationModal";
import profileService from "@/services/profileService";
import otpService from "@/services/otpService";
import AuthService from "@/services/authService";

export default function ProfilePage() {
  const { user, isAuthenticated, refreshUserInfo } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile state
  const [profileExists, setProfileExists] = useState(false); // Track if profile already exists
  
  // Form state - enhanced to match backend structure
  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    fullName: "",
    avatar: "",        // Backend avatar URL
    gender: "Male",
    bio: "",
    detailAddress: "",  // Backend uses DetailAddress
    dateOfBirth: "",
    provinceId: "",      // For AddressSelector (ID)
    wardId: "",          // Backend uses WardId (not CommuneId)
    provinceName: "",    // For display (Name)
    wardName: "",        // Backend uses WardName (not CommuneName)
    // CCCD fields (optional)
    frontImageUrl: "",
    backImageUrl: "",
    temporaryResidence: "",
    citizenIdNumber: "",
    citizenIdIssuedDate: "",
    citizenIdIssuedPlace: ""
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  
  // CCCD image upload state
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState("");
  const [backImageFile, setBackImageFile] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState("");

  // Face registration modal state
  const [showFaceModal, setShowFaceModal] = useState(false);

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // OTP states for phone/email updates
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Load profile data from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Sync avatar preview - prioritize file over backend URL
  useEffect(() => {
    if (!avatarFile && profile.avatar) {
      // If no file selected, use backend avatar URL
      setAvatarPreview(profile.avatar);
    }
  }, [profile.avatar, avatarFile]);

  // Sync front CCCD image preview
  useEffect(() => {
    if (!frontImageFile && profile.frontImageUrl) {
      // If no file selected, use backend URL
      setFrontImagePreview(profile.frontImageUrl);
    }
  }, [profile.frontImageUrl, frontImageFile]);

  // Sync back CCCD image preview
  useEffect(() => {
    if (!backImageFile && profile.backImageUrl) {
      // If no file selected, use backend URL
      setBackImagePreview(profile.backImageUrl);
    }
  }, [profile.backImageUrl, backImageFile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      console.log("🔍 Current user object:", user);
      
      // First, fetch account info to get email, phone, fullName
      let accountInfo = null;
      const userId = user?.id || user?.sub || user?.userId;
      
      if (userId) {
        console.log("👤 Fetching account info for userId:", userId);
        const accountResponse = await AuthService.getAccountInfo(userId);
        console.log("📥 Account response:", accountResponse);
        
        if (accountResponse.success) {
          accountInfo = accountResponse.data;
          console.log("✅ Account info loaded:", accountInfo);
        } else {
          console.error("❌ Failed to load account info:", accountResponse.message);
        }
      } else {
        console.warn("⚠️ No userId found in user object:", user);
      }
      
      const profileData = await profileService.getProfile();
      
      console.log("🔍 ===== PROFILE DATA DEBUG =====");
      console.log("🔍 Raw profile data from API:", JSON.stringify(profileData, null, 2));
      console.log("🔍 Profile data type:", typeof profileData);
      console.log("🔍 Profile data keys:", profileData ? Object.keys(profileData) : 'null');
      
      if (profileData) {
        console.log("📄 Profile loaded from backend");
        console.log("📄 All fields check:", {
          email: profileData.email,
          phone: profileData.phone,
          fullName: profileData.fullName,
          dateOfBirth: profileData.dateOfBirth,
          bio: profileData.bio,
          avatar: profileData.avatar,
          detailAddress: profileData.detailAddress,
          provinceId: profileData.provinceId,
          wardId: profileData.wardId,
          provinceName: profileData.provinceName,
          wardName: profileData.wardName,
          citizenIdNumber: profileData.citizenIdNumber,
          gender: profileData.gender,
          // Image URLs - IMPORTANT
          frontImageUrl: profileData.frontImageUrl,
          backImageUrl: profileData.backImageUrl
        });
        
        setProfileExists(true); // Profile exists
        
        // Map backend response (camelCase format) to frontend state
        // Priority: Profile data > Account info > Token data
        const newProfileState = {
          email: profileData.email || accountInfo?.email || user?.email || "",
          phone: profileData.phone || accountInfo?.phone || user?.phone || "",
          fullName: profileData.fullName || accountInfo?.fullName || user?.fullName || "",
          avatar: profileData.avatar || "",
          gender: profileService.getGenderText(profileData.gender) || "Male",
          bio: profileData.bio || "",
          detailAddress: profileData.detailAddress || "", 
          dateOfBirth: profileData.dateOfBirth ? 
            new Date(profileData.dateOfBirth).toISOString().split('T')[0] : "",
          // Address: backend uses provinceId/wardId and provinceName/wardName (camelCase)
          provinceId: (profileData.provinceId || "").toString(),
          wardId: (profileData.wardId || "").toString(),
          provinceName: profileData.provinceName || "",
          wardName: profileData.wardName || "",
          // CCCD fields
          frontImageUrl: profileData.frontImageUrl || "",
          backImageUrl: profileData.backImageUrl || "",
          temporaryResidence: profileData.temporaryResidence || "",
          citizenIdNumber: profileData.citizenIdNumber || "",
          citizenIdIssuedDate: profileData.citizenIdIssuedDate ? 
            new Date(profileData.citizenIdIssuedDate).toISOString().split('T')[0] : "",
          citizenIdIssuedPlace: profileData.citizenIdIssuedPlace || ""
        };
        
        console.log("🖼️ IMAGE URLS DEBUG:");
        console.log("  - Backend frontImageUrl:", profileData.frontImageUrl);
        console.log("  - Backend backImageUrl:", profileData.backImageUrl);
        console.log("  - Backend avatar:", profileData.avatar);
        console.log("  - Mapped frontImageUrl:", newProfileState.frontImageUrl);
        console.log("  - Mapped backImageUrl:", newProfileState.backImageUrl);
        console.log("  - Mapped avatar:", newProfileState.avatar);
        console.log("✅ New profile state to set:", JSON.stringify(newProfileState, null, 2));
        
        setProfile(newProfileState);
        
        console.log("✅ Profile state updated successfully");
      } else {
        console.log("📝 Profile not found, user needs to create one");
        setProfileExists(false); // Profile does not exist
        // Initialize with basic user data from account info or token
        setProfile(prev => ({
          ...prev,
          email: accountInfo?.email || accountInfo?.Email || user?.email || "",
          phone: accountInfo?.phone || accountInfo?.Phone || user?.phone || "",
          fullName: accountInfo?.fullName || accountInfo?.FullName || user?.fullName || ""
        }));
      }
    } catch (error) {
      console.error("❌ Error loading profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle avatar file upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle front CCCD image file upload
  const handleFrontImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFrontImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle back CCCD image file upload
  const handleBackImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle address selection - receive full address object from AddressSelector
  const handleAddressChange = (addressData) => {
    setProfile(prev => ({
      ...prev,
      provinceId: addressData.provinceCode?.toString() || "",    // Convert to string for backend
      wardId: addressData.wardCode?.toString() || "",            // Backend uses wardId
      provinceName: addressData.provinceName || "",              // Save name for display
      wardName: addressData.wardName || "",                      // Backend uses wardName
      detailAddress: addressData.address || ""                   // Detail address
    }));
  };

  // Request Phone OTP
  const handleRequestPhoneOtp = async () => {
    if (!pendingPhone) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setOtpLoading(true);
      await otpService.requestPhoneOtp(pendingPhone);
      setShowPhoneOtp(true);
      setSuccess("OTP sent to your phone");
      setError("");
    } catch (error) {
      setError("Failed to send phone OTP");
      console.error(error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Request Email OTP  
  const handleRequestEmailOtp = async () => {
    if (!pendingEmail) {
      setError("Please enter an email address");
      return;
    }

    try {
      setOtpLoading(true);
      await otpService.requestEmailOtp(pendingEmail);
      setShowEmailOtp(true);
      setSuccess("OTP sent to your email");
      setError("");
    } catch (error) {
      setError("Failed to send email OTP");
      console.error(error);
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify and update phone
  const handleUpdatePhone = async () => {
    if (!otpService.verifyOtp(pendingPhone, phoneOtp)) {
      setError("Invalid or expired OTP");
      return;
    }

    try {
      setLoading(true);
      await profileService.updatePhone(pendingPhone, phoneOtp);
      setProfile(prev => ({ ...prev, phone: pendingPhone }));
      setSuccess("Phone updated successfully");
      setShowPhoneOtp(false);
      setPendingPhone("");
      setPhoneOtp("");
      otpService.clearOtp(pendingPhone);
      setError("");
    } catch (error) {
      setError("Failed to update phone");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Verify and update email
  const handleUpdateEmail = async () => {
    if (!otpService.verifyOtp(pendingEmail, emailOtp)) {
      setError("Invalid or expired OTP");
      return;
    }

    try {
      setLoading(true);
      await profileService.updateEmail(pendingEmail, emailOtp);
      setProfile(prev => ({ ...prev, email: pendingEmail }));
      setSuccess("Email updated successfully");
      setShowEmailOtp(false);
      setPendingEmail("");
      setEmailOtp("");
      otpService.clearOtp(pendingEmail);
      setError("");
    } catch (error) {
      setError("Failed to update email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    try {
      setChangingPassword(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("authToken") || localStorage.getItem("ezstay_token");
      if (!token) {
        setPasswordError("Not authenticated. Please login again.");
        return;
      }

      // Get email from profile or user or localStorage
      const email = profile.email || user?.email || localStorage.getItem("userEmail");
      if (!email) {
        setPasswordError("Email not found. Please refresh the page.");
        return;
      }

      console.log("🔐 Changing password for email:", email);
      console.log("Token exists:", !!token);

      // Call API
      const response = await fetch("https://localhost:7000/api/User/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: email,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = "Failed to change password";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.Message || errorMessage;
        } catch (e) {
          // If no JSON body, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse success response, but don't fail if empty
      let successMessage = "✅ Password changed successfully!";
      try {
        const data = await response.json();
        if (data?.message || data?.Message) {
          successMessage = `✅ ${data.message || data.Message}`;
        }
      } catch (e) {
        // Empty response is OK for success
        console.log("Empty response (success)");
      }

      setPasswordSuccess(successMessage);
      
      // Clear form
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess("");
      }, 2000);

    } catch (error) {
      console.error("❌ Change password error:", error);
      setPasswordError(error.message || "Failed to change password. Please check your current password.");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle form submission - POST (create) or PUT (update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for backend API
      const profileData = {
        fullName: profile.fullName,
        gender: profile.gender, // profileService will convert to enum
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth,
        detailAddress: profile.detailAddress,
        provinceId: profile.provinceId,
        wardId: profile.wardId, // Backend uses wardId
        // CCCD fields (optional)
        temporaryResidence: profile.temporaryResidence,
        citizenIdNumber: profile.citizenIdNumber,
        citizenIdIssuedDate: profile.citizenIdIssuedDate,
        citizenIdIssuedPlace: profile.citizenIdIssuedPlace
      };

      console.log("📤 Profile data:", profileData);
      console.log("🖼️ Avatar file:", avatarFile);
      console.log("📷 Front CCCD file:", frontImageFile);
      console.log("📷 Back CCCD file:", backImageFile);
      console.log("📝 Profile exists:", profileExists);
      
      // Add avatar file to profileData ONLY if new file selected
      // Backend expects IFormFile, not string URL
      // If no new file - DON'T send field, backend will keep existing avatar
      if (avatarFile) {
        console.log("📤 Will send avatar file to backend...");
        profileData.avatar = avatarFile; // Send IFormFile
        console.log("✅ Avatar file added to FormData");
      } else {
        // DON'T send avatar field - backend will keep existing avatar
        console.log("ℹ️ No new avatar file - backend will keep existing avatar");
      }
      
      // Add CCCD image files to profileData ONLY if new files selected
      // Backend expects IFormFile, not string URL
      // If no new file - DON'T send field, backend will keep existing URL
      if (frontImageFile) {
        console.log("📤 Will send front CCCD image file to backend...");
        profileData.frontImageUrl = frontImageFile; // Send IFormFile
        console.log("✅ Front CCCD image file added to FormData");
      } else {
        // DON'T send string URL - backend expects IFormFile only
        // Backend will keep existing URL if field is not sent (null check)
        console.log("ℹ️ No new front CCCD file - backend will keep existing image");
      }
      
      if (backImageFile) {
        console.log("📤 Will send back CCCD image file to backend...");
        profileData.backImageUrl = backImageFile; // Send IFormFile
        console.log("✅ Back CCCD image file added to FormData");
      } else {
        // DON'T send string URL - backend expects IFormFile only
        // Backend will keep existing URL if field is not sent (null check)
        console.log("ℹ️ No new back CCCD file - backend will keep existing image");
      }
      
      let result;
      const wasNewProfile = !profileExists;
      
      if (!profileExists) {
        // POST: Create new profile (first time)
        console.log("📝 Creating new profile...");
        result = await profileService.createProfile(profileData);
        console.log("📥 Profile created:", result);
        setSuccess("Profile created successfully! Reloading...");
        
        // Wait a bit for backend to process
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        // PUT: Update existing profile
        console.log("📝 Updating profile...");
        result = await profileService.updateProfile(profileData);
        console.log("📥 Profile updated:", result);
        setSuccess("Profile updated successfully! Reloading...");
      }
      
      // Reload profile data to reflect changes
      console.log("🔄 Reloading profile to get latest data...");
      await loadProfile();
      
      // Clear file states after successful save
      setAvatarFile(null);
      setFrontImageFile(null);
      setFrontImagePreview("");
      setBackImageFile(null);
      setBackImagePreview("");
      
      // Update success message after reload
      if (wasNewProfile) {
        setSuccess("✅ Profile created and loaded successfully!");
      } else {
        setSuccess("✅ Profile updated successfully!");
      }
      
      // Refresh user info in auth context to update navbar avatar
      console.log("🔄 Refreshing user info for navbar...");
      await refreshUserInfo(true); // Pass true to load avatar
      
      console.log("🔄 Profile operation complete");
    } catch (err) {
      console.error("❌ Profile error:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      // Display detailed error message
      const errorMsg = err.message || 
                      err.response?.data?.message ||
                      err.response?.data?.title ||
                      "Failed to save profile. Please check console for details.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ← Back
            </button>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your personal information and preferences
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Profile Picture
              </h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("❌ Avatar URL failed to load:", avatarPreview);
                          setError(`Invalid avatar URL: ${avatarPreview}`);
                          setAvatarPreview("");
                          setProfile(prev => ({ ...prev, avatar: "" }));
                        }}
                        onLoad={() => {
                          console.log("✅ Avatar loaded successfully:", avatarPreview);
                          setError(""); // Clear any previous errors
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Choose Avatar Image
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG, PNG, or GIF. Max file size 2MB.
                    </p>
                    {avatarFile && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✅ Selected: {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Face Registration Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                  Face Recognition
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Register your face for quick and secure login using facial recognition
                </p>
                <button
                  type="button"
                  onClick={() => setShowFaceModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Register Face
                </button>
              </div>

              {/* Change Password Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">
                  Security
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Update your password to keep your account secure
                </p>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profileExists ? "Full name from your profile" : "Enter your full name"}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profileExists ? "Email from your profile" : "Enter your email"}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profileExists ? "Phone from your profile" : "Enter your phone number"}
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Address Selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <AddressSelector
                  value={{
                    provinceCode: profile.provinceId ? parseInt(profile.provinceId) : null,
                    provinceName: profile.provinceName,
                    wardCode: profile.wardId ? parseInt(profile.wardId) : null,
                    wardName: profile.wardName,
                    address: profile.detailAddress
                  }}
                  onChange={handleAddressChange}
                  className="space-y-4"
                />
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Citizen ID Information (CCCD) - Optional */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Citizen ID Information (Optional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Citizen ID Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Citizen ID Number (CCCD)
                  </label>
                  <input
                    type="text"
                    name="citizenIdNumber"
                    value={profile.citizenIdNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 001234567890"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Citizen ID Issued Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issued Date
                  </label>
                  <input
                    type="date"
                    name="citizenIdIssuedDate"
                    value={profile.citizenIdIssuedDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Citizen ID Issued Place */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issued Place
                  </label>
                  <input
                    type="text"
                    name="citizenIdIssuedPlace"
                    value={profile.citizenIdIssuedPlace}
                    onChange={handleInputChange}
                    placeholder="e.g., Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Temporary Residence */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temporary Residence Address
                  </label>
                  <input
                    type="text"
                    name="temporaryResidence"
                    value={profile.temporaryResidence}
                    onChange={handleInputChange}
                    placeholder="Enter temporary residence address if different from current address"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Front Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Front ID Image
                  </label>
                  <input
                    type="file"
                    id="front-image-upload"
                    accept="image/*"
                    onChange={handleFrontImageFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="front-image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Front Image
                  </label>
                  {frontImageFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✅ Selected: {frontImageFile.name}
                    </p>
                  )}
                  {!frontImageFile && profile.frontImageUrl && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      📷 Current image uploaded
                    </p>
                  )}
                </div>

                {/* Back Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Back ID Image
                  </label>
                  <input
                    type="file"
                    id="back-image-upload"
                    accept="image/*"
                    onChange={handleBackImageFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="back-image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Back Image
                  </label>
                  {backImageFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✅ Selected: {backImageFile.name}
                    </p>
                  )}
                  {!backImageFile && profile.backImageUrl && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      📷 Current image uploaded
                    </p>
                  )}
                </div>
              </div>

              {/* Preview CCCD Images */}
              {(frontImagePreview || profile.frontImageUrl || backImagePreview || profile.backImageUrl) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(frontImagePreview || profile.frontImageUrl) && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Front ID Preview {frontImagePreview && "(New)"}
                      </p>
                      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                        <img
                          src={frontImagePreview || profile.frontImageUrl}
                          alt="Front ID"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {(backImagePreview || profile.backImageUrl) && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Back ID Preview {backImagePreview && "(New)"}
                      </p>
                      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                        <img
                          src={backImagePreview || profile.backImageUrl}
                          alt="Back ID"
                          className="w-full h-auto"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
              >
                {loading ? "Saving..." : profileExists ? "Update Profile" : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Face Registration Modal */}
      <FaceRegistrationModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={() => {
          setSuccess("Face registered successfully!");
          setShowFaceModal(false);
        }}
      />

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowChangePasswordModal(false);
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                setPasswordError("");
                setPasswordSuccess("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Change Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your current password and choose a new one
              </p>
            </div>

            {/* Success message */}
            {passwordSuccess && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-sm">{passwordSuccess}</p>
              </div>
            )}

            {/* Error message */}
            {passwordError && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter current password"
                  disabled={changingPassword}
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={changingPassword}
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm new password"
                  disabled={changingPassword}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                    setPasswordError("");
                    setPasswordSuccess("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  disabled={changingPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

