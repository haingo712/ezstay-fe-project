"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import profileService from "@/services/profileService";

// Mock data for locations (replace with real API calls when backend is ready)
const provinces = [
  { id: 1, name: "Ho Chi Minh City" },
  { id: 2, name: "Hanoi" },
  { id: 3, name: "Da Nang" },
  { id: 4, name: "Can Tho" },
  { id: 5, name: "Hai Phong" },
  { id: 6, name: "Binh Duong" },
  { id: 7, name: "Dong Nai" },
  { id: 8, name: "Ba Ria - Vung Tau" },
];

const districts = {
  1: [
    { id: 11, name: "District 1" },
    { id: 12, name: "District 2" },
    { id: 13, name: "District 3" },
    { id: 14, name: "District 4" },
    { id: 15, name: "District 5" },
    { id: 16, name: "Binh Thanh District" },
    { id: 17, name: "Tan Binh District" },
    { id: 18, name: "Thu Duc City" },
  ],
  2: [
    { id: 21, name: "Ba Dinh District" },
    { id: 22, name: "Hoan Kiem District" },
    { id: 23, name: "Hai Ba Trung District" },
    { id: 24, name: "Dong Da District" },
    { id: 25, name: "Cau Giay District" },
    { id: 26, name: "Thanh Xuan District" },
  ],
};

const wards = {
  11: [
    { id: 111, name: "Ben Nghe Ward" },
    { id: 112, name: "Ben Thanh Ward" },
    { id: 113, name: "Nguyen Thai Binh Ward" },
    { id: 114, name: "Pham Ngu Lao Ward" },
  ],
  12: [
    { id: 121, name: "An Phu Ward" },
    { id: 122, name: "An Khanh Ward" },
    { id: 123, name: "Binh An Ward" },
    { id: 124, name: "Cat Lai Ward" },
  ],
};

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Form state - simplified to match backend structure
  const [profile, setProfile] = useState({
    email: "",
    phone: "",
    fullName: "",
    avatar: "",
    gender: "",
    bio: "",
    address: "",
  });

  // Dropdown states
  const [filteredProvinces, setFilteredProvinces] = useState(provinces);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredWards, setFilteredWards] = useState([]);
  const [searchTerms, setSearchTerms] = useState({
    province: "",
    district: "",
    ward: "",
  });

  // Avatar preview
  const [avatarPreview, setAvatarPreview] = useState("");

  // Load profile data from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileService.getProfile();
      
      setProfile({
        email: profileData.email || user?.email || "",
        phone: profileData.phone || user?.phone || "",
        fullName: profileData.fullName || user?.fullName || "",
        avatar: profileData.avata || "", // Note: backend uses "Avata" 
        gender: profileService.getGenderText(profileData.gender) || "",
        bio: profileData.bio || "",
        address: profileData.adrress || "", // Note: backend uses "Adrress"
      });
      setAvatarPreview(profileData.avata || "");
    } catch (err) {
      console.error('Error loading profile:', err);
      // Fallback to user data from auth
      if (user) {
        setProfile(prev => ({
          ...prev,
          email: user.email || "",
          phone: user.phone || "",
          fullName: user.fullName || "",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes - simplified
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search in dropdowns
  const handleSearch = (type, value) => {
    setSearchTerms((prev) => ({ ...prev, [type]: value }));

    switch (type) {
      case "province":
        const filtered = provinces.filter((province) =>
          province.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProvinces(filtered);
        break;
      case "district":
        const districtList = districts[profile.address.provinceId] || [];
        const filteredDistricts = districtList.filter((district) =>
          district.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredDistricts(filteredDistricts);
        break;
      case "ward":
        const wardList = wards[profile.address.districtId] || [];
        const filteredWards = wardList.filter((ward) =>
          ward.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredWards(filteredWards);
        break;
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Avatar file size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        setProfile((prev) => ({
          ...prev,
          avatar: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for backend API
      const profileData = {
        adrress: profile.address, // Backend expects "Adrress"
        gender: profileService.getGenderEnum(profile.gender), // Convert to enum
        avata: profile.avatar, // Backend expects "Avata"
        bio: profile.bio,
      };

      console.log("Profile data to save:", profileData);
      
      await profileService.createProfile(profileData);
      
      setSuccess("Profile updated successfully!");
      
      // Reload profile data to reflect changes
      await loadProfile();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (type, id) => {
    switch (type) {
      case "province":
        return provinces.find((p) => p.id == id)?.name || "";
      case "district":
        const districtList = districts[profile.address.provinceId] || [];
        return districtList.find((d) => d.id == id)?.name || "";
      case "ward":
        const wardList = wards[profile.address.districtId] || [];
        return wardList.find((w) => w.id == id)?.name || "";
      default:
        return "";
    }
  };

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800 py-8">
          <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your personal information and preferences
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

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
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
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
              <div>
                <label className="block">
                  <span className="sr-only">Choose avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 dark:hover:file:bg-blue-900/30 transition-colors"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Province/City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search province..."
                    value={searchTerms.province}
                    onChange={(e) => handleSearch("province", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {searchTerms.province && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredProvinces.map((province) => (
                        <button
                          key={province.id}
                          type="button"
                          onClick={() => {
                            setProfile((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                provinceId: province.id,
                                districtId: "",
                                wardId: "",
                              },
                            }));
                            setSearchTerms((prev) => ({ ...prev, province: province.name }));
                            setFilteredDistricts(districts[province.id] || []);
                            setFilteredWards([]);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {province.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {profile.address.provinceId && !searchTerms.province && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Selected: {getLocationName("province", profile.address.provinceId)}
                  </p>
                )}
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search district..."
                    value={searchTerms.district}
                    onChange={(e) => handleSearch("district", e.target.value)}
                    disabled={!profile.address.provinceId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {searchTerms.district && filteredDistricts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredDistricts.map((district) => (
                        <button
                          key={district.id}
                          type="button"
                          onClick={() => {
                            setProfile((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                districtId: district.id,
                                wardId: "",
                              },
                            }));
                            setSearchTerms((prev) => ({ ...prev, district: district.name }));
                            setFilteredWards(wards[district.id] || []);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {district.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {profile.address.districtId && !searchTerms.district && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Selected: {getLocationName("district", profile.address.districtId)}
                  </p>
                )}
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ward
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ward..."
                    value={searchTerms.ward}
                    onChange={(e) => handleSearch("ward", e.target.value)}
                    disabled={!profile.address.districtId}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {searchTerms.ward && filteredWards.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredWards.map((ward) => (
                        <button
                          key={ward.id}
                          type="button"
                          onClick={() => {
                            setProfile((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                wardId: ward.id,
                              },
                            }));
                            setSearchTerms((prev) => ({ ...prev, ward: ward.name }));
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          {ward.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {profile.address.wardId && !searchTerms.ward && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Selected: {getLocationName("ward", profile.address.wardId)}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={profile.address.street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter street address, apartment, suite, etc."
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
              Bio
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About You
              </label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                placeholder="Tell us about yourself..."
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {profile.bio.length}/500 characters
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-green-800 dark:text-green-400">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
      </ProtectedRoute>
  );
}
