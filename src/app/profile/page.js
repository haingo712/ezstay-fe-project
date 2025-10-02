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

export default function ProfilePage() {
  const { user, isAuthenticated, refreshUserInfo } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state - enhanced to match backend structure
  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    fullName: "",
    avatar: "",        // Backend avatar URL (from Avata field)
    gender: "Male",
    bio: "",
    address: "",
    dateOfBirth: "",
    provinceId: "",      // For AddressSelector (ID)
    communeId: "",       // For AddressSelector (ID)
    provinceName: "",    // For display (Name)
    communeName: ""      // For display (Name)
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  // Face registration modal state
  const [showFaceModal, setShowFaceModal] = useState(false);

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

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();
      
      if (profileData) {
        console.log("📄 Profile loaded from backend:", profileData);
        
        // Map backend response (UserResponseDTO) to frontend state
        setProfile({
          email: user?.email || "",
          phone: profileData.Phone || user?.phone || "",
          fullName: profileData.FullName || user?.fullName || "",
          avatar: profileData.Avata || "", // Backend typo "Avata" - this is the image URL
          gender: profileService.getGenderText(profileData.Gender) || "Male",
          bio: profileData.Bio || "",
          address: profileData.Adrress || "", // Backend typo "Adrress" 
          dateOfBirth: profileData.DateOfBirth ? 
            new Date(profileData.DateOfBirth).toISOString().split('T')[0] : "",
          // Address: backend stores Province/Commune names but expects ProvinceId/CommuneId for updates
          provinceId: profileData.ProvinceId || "", // ID for AddressSelector
          communeId: profileData.CommuneId || "",   // ID for AddressSelector  
          provinceName: profileData.Province || "", // Name for display
          communeName: profileData.Commune || ""    // Name for display
        });
      } else {
        console.log("📝 Profile exists but empty, initializing with user data from token");
        // Backend auto-creates empty profile, just initialize with token data
        setProfile(prev => ({
          ...prev,
          email: user?.email || "",
          phone: user?.phone || "",
          fullName: user?.fullName || ""
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

  // Handle address selection - receive full address object from AddressSelector
  const handleAddressChange = (addressData) => {
    setProfile(prev => ({
      ...prev,
      provinceId: addressData.provinceCode?.toString() || "",    // Convert to string for backend
      communeId: addressData.wardCode?.toString() || "",         // Convert to string for backend  
      provinceName: addressData.provinceName || "",              // Save name for display
      communeName: addressData.wardName || "",                   // Save name for display
      address: addressData.address || ""                         // Detail address
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

  // Handle form submission - Only for updating existing profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for backend update-profile API
      const profileData = {
        fullName: profile.fullName,
        gender: profile.gender, // Keep as text, updateProfile will convert to enum
        bio: profile.bio,
        dateOfBirth: profile.dateOfBirth,
        phone: profile.phone,
        provinceId: profile.provinceId,
        communeId: profile.communeId
      };

      console.log("📤 Profile data to update:", profileData);
      console.log("🖼️ Avatar file:", avatarFile);
      
      // Always update - this page is only for updating existing profiles
      console.log("📝 Updating profile...");
      const result = await profileService.updateProfile(profileData, avatarFile);
      console.log("📥 Backend response:", result);
      
      setSuccess("Profile updated successfully!");
      
      // Reload profile data to reflect changes
      console.log("🔄 Reloading profile after update...");
      await loadProfile();
      
      // Refresh user info in auth context to update navbar avatar
      console.log("🔄 Refreshing user info for navbar...");
      await refreshUserInfo(true); // Pass true to load avatar
      
      console.log("🔄 Profile update complete");
    } catch (err) {
      console.error("❌ Profile update error:", err);
      setError(err.message || "Failed to update profile");
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Full name is from your account registration
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Phone number is from your account registration
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

              {/* Address Selector */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <AddressSelector
                  value={{
                    provinceCode: profile.provinceId ? parseInt(profile.provinceId) : null,
                    provinceName: profile.provinceName,
                    wardCode: profile.communeId ? parseInt(profile.communeId) : null,
                    wardName: profile.communeName,
                    address: profile.address
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
                {loading ? "Updating..." : "Update Profile"}
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
    </ProtectedRoute>
  );
}

