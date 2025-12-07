"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { boardingHouseAPI, roomAPI } from "@/utils/api";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import AddressSelector from "@/components/AddressSelector";
import vietnamAddressService from "@/services/vietnamAddressService";
import notification from "@/utils/notification";

// Image Gallery Component for Boarding House - 3 Thumbnails Layout
function ImageCarousel({ images, houseName, t }) {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fallback image if no images
  const displayImages = images && images.length > 0 ? images : ["/image.png"];
  const hasMultipleImages = displayImages.length > 1 && displayImages[0] !== "/image.png";

  return (
    <>
      {/* 3-Image Thumbnail Layout */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {!hasMultipleImages ? (
          // Single image or placeholder
          <div
            className="w-full h-full cursor-pointer"
            onClick={() => setShowGallery(true)}
          >
            <img
              src={displayImages[0]}
              alt={houseName}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        ) : (
          // 3-thumbnail grid layout
          <div className="flex h-full gap-1">
            {/* Large image - Left side (60% width) */}
            <div
              className="w-[60%] h-full cursor-pointer overflow-hidden group"
              onClick={() => {
                setSelectedImage(0);
                setShowGallery(true);
              }}
            >
              <img
                src={displayImages[0]}
                alt={`${houseName} - 1`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Right side - 2 small images stacked (40% width) */}
            <div className="flex-1 flex flex-col gap-1">
              {/* Small image 1 */}
              <div
                className="h-1/2 cursor-pointer overflow-hidden group"
                onClick={() => {
                  setSelectedImage(1);
                  setShowGallery(true);
                }}
              >
                <img
                  src={displayImages[1]}
                  alt={`${houseName} - 2`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Small image 2 with overlay (if more images) */}
              <div
                className="h-1/2 cursor-pointer overflow-hidden group relative"
                onClick={() => {
                  setSelectedImage(2);
                  setShowGallery(true);
                }}
              >
                <img
                  src={displayImages[2] || displayImages[1]}
                  alt={`${houseName} - 3`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Overlay with "+N more" if there are more than 3 images */}
                {displayImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                    <div className="text-white text-center">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-lg font-bold">+{displayImages.length - 3}</div>
                      <div className="text-xs">{t('ownerBoardingHouses.card.morePhotos')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image counter badge */}
        {hasMultipleImages && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center z-10">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {displayImages.length} {t('ownerBoardingHouses.card.photos')}
          </div>
        )}
      </div>

      {/* Gallery Modal - Grid Layout */}
      {showGallery && (
        <div
          className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
          onClick={() => setShowGallery(false)}
        >
          <div className="min-h-screen p-4 pb-20">
            {/* Header with close button */}
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm -mx-4 px-4 py-3 mb-4 flex items-center justify-between">
              <div className="text-white">
                <h3 className="font-semibold text-lg">{houseName}</h3>
                <p className="text-sm text-gray-300">{displayImages.length} {t('ownerBoardingHouses.card.photos')}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGallery(false);
                }}
                className="text-white hover:text-gray-300 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Grid of all images */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden ${selectedImage === idx ? 'ring-4 ring-blue-500' : ''
                    }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(idx);
                  }}
                >
                  <img
                    src={img}
                    alt={`${houseName} - Photo ${idx + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {idx + 1} / {displayImages.length}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BoardingHousesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [boardingHouses, setBoardingHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);
  const [houseData, setHouseData] = useState({
    houseName: '',
    description: '',
    addressData: {
      provinceCode: null,
      provinceName: '',
      wardCode: null,
      wardName: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Image upload states
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    setMounted(true);
    if (!authLoading && isAuthenticated && user) {
      fetchBoardingHouses();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchBoardingHouses = async () => {
    if (!user || !user.id) {
      console.log("❌ No user ID available for fetching boarding houses");
      setError(t('ownerBoardingHouses.errors.notAuthenticated'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🏠 Fetching boarding houses for user:", user.id, "Role:", user.role);
      console.log("📄 Full user object:", user);

      // Debug token info
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log("🔐 JWT Payload:", payload);
        } catch (e) {
          console.log("❌ Error parsing JWT:", e);
        }
      }

      const houses = await boardingHouseAPI.getByOwnerId(user.id);
      console.log("✅ Fetched boarding houses:", houses);

      const housesWithDetails = await Promise.all(houses.map(async (house) => {
        try {
          const rooms = await roomAPI.getByHouseId(house.id);
          const occupiedRooms = rooms.filter(r => r.roomStatus !== "Available").length;
          return { ...house, totalRooms: rooms.length, occupiedRooms, vacantRooms: rooms.length - occupiedRooms };
        }
        catch (e) {
          console.warn("Error fetching rooms for house:", house.id, e);
          return { ...house, totalRooms: 0, occupiedRooms: 0, vacantRooms: 0 };
        }
      }));
      setBoardingHouses(housesWithDetails);
    } catch (e) {
      console.error("Error fetching boarding houses:", e);
      setError(t('ownerBoardingHouses.errors.loadFailed') + ": " + (e.message || e));
    }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const errors = {};

    // Validate house name (required, max 100 characters)
    if (!houseData.houseName.trim()) {
      errors.houseName = t('ownerBoardingHouses.modal.houseNameRequired');
    } else if (houseData.houseName.length > 100) {
      errors.houseName = t('ownerBoardingHouses.modal.houseNameMaxLength');
    }

    // Validate address using the Vietnam address service
    const addressValidation = vietnamAddressService.validateAddress(houseData.addressData);
    if (!addressValidation.isValid) {
      Object.assign(errors, addressValidation.errors);
    }

    // Validate images - chỉ validate khi update và có ảnh cũ
    if (editingHouse) {
      const existingImageUrls = imagePreviews.filter(preview => typeof preview === 'string');
      if (!existingImageUrls || existingImageUrls.length === 0) {
        errors.images = 'At least 1 image is required. Please keep existing images.';
      }
    } else {
      // Validate images khi tạo mới
      if (selectedImages.length === 0) {
        errors.images = 'Please select at least 1 image for the boarding house.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      notification.error(t('ownerBoardingHouses.messages.invalidFileTypes'));
      return;
    }

    // Add new files to existing selection
    setSelectedImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove selected image
  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Validate required fields before submission
      if (!houseData.addressData.provinceCode) {
        notification.warning(t('ownerBoardingHouses.messages.selectProvince'));
        setSubmitting(false);
        return;
      }
      if (!houseData.addressData.wardCode) {
        notification.warning(t('ownerBoardingHouses.messages.selectWard'));
        setSubmitting(false);
        return;
      }
      if (!houseData.addressData.address) {
        notification.warning(t('ownerBoardingHouses.messages.enterAddress'));
        setSubmitting(false);
        return;
      }

      // Validate images - REQUIRED by backend
      if (!selectedImages || selectedImages.length === 0) {
        notification.warning('Vui lòng chọn ít nhất 1 ảnh cho nhà trọ');
        setSubmitting(false);
        return;
      }

      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add house data fields
      formData.append('HouseName', houseData.houseName.trim());

      // Description is optional
      if (houseData.description && houseData.description.trim()) {
        formData.append('Description', houseData.description.trim());
      }

      // Add Location fields - ASP.NET Core supports nested object binding with dot notation
      // Must match CreateHouseLocationDTO properties exactly
      formData.append('Location.ProvinceId', houseData.addressData.provinceCode.toString());
      formData.append('Location.CommuneId', houseData.addressData.wardCode.toString());
      formData.append('Location.AddressDetail', houseData.addressData.address.trim());

      // Add images - Required by backend
      selectedImages.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, file.name, file.type, file.size, 'bytes');
        formData.append('Files', file);
      });

      console.log("📤 Creating boarding house with FormData");
      console.log("📸 Number of images:", selectedImages.length);
      console.log("📋 FormData entries:");
      const formDataEntries = [];
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          const entry = `${pair[0]} => File: ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes`;
          console.log(entry);
          formDataEntries.push(entry);
        } else {
          const entry = `${pair[0]} => ${pair[1]}`;
          console.log(entry);
          formDataEntries.push(entry);
        }
      }

      console.log("📋 All FormData keys:", Array.from(formData.keys()));

      const res = await boardingHouseAPI.create(formData);
      console.log("✅ Create response:", res);

      if (res && res.isSuccess !== false) {
        notification.success(t('ownerBoardingHouses.messages.createSuccess') + (selectedImages.length > 0 ? ` ${t('ownerBoardingHouses.messages.createSuccessWithImages').replace('{{count}}', selectedImages.length)}` : '') + '!');
        setShowModal(false);
        // Reset form
        setHouseData({
          houseName: '',
          description: '',
          addressData: {
            provinceCode: null,
            provinceName: '',
            wardCode: null,
            wardName: '',
            address: ''
          }
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setFormErrors({});
        fetchBoardingHouses();
      }
      else {
        notification.error(t('ownerBoardingHouses.errors.createFailed') + ': ' + (res?.message || JSON.stringify(res)));
      }
    } catch (e) {
      console.error("❌ Create error:", e);
      console.error("❌ Error response:", e.response);
      console.error("❌ Error response data:", e.response?.data);
      console.error("❌ Error status:", e.response?.status);
      console.error("❌ Error config:", e.config);

      let errorMessage = 'API error creating boarding house:\n';
      if (e.response?.data?.message) {
        errorMessage += e.response.data.message;
      } else if (e.response?.data?.title) {
        errorMessage += e.response.data.title;
        if (e.response?.data?.errors) {
          // ASP.NET validation errors
          errorMessage += '\n\nValidation errors:';
          Object.entries(e.response.data.errors).forEach(([field, msgs]) => {
            errorMessage += `\n- ${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
          });
        }
      } else if (e.response?.data) {
        errorMessage += JSON.stringify(e.response.data);
      } else if (e.message) {
        errorMessage += e.message;
      } else {
        errorMessage += 'Unknown error';
      }

      notification.error(errorMessage);
    }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!editingHouse) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Backend PUT endpoint expects JSON with ImageUrls (array of strings), not FormData
      // Filter imagePreviews to keep only existing URLs (strings), exclude new File previews
      const existingImageUrls = imagePreviews.filter(preview => typeof preview === 'string');

      const updateData = {
        HouseName: houseData.houseName,
        Description: houseData.description || '',
        ImageUrls: existingImageUrls, // Array of existing image URL strings
        Location: {
          ProvinceId: houseData.addressData.provinceCode?.toString() || '',
          CommuneId: houseData.addressData.wardCode?.toString() || '',
          AddressDetail: houseData.addressData.address || ''
        }
      };

      console.log("📤 Updating boarding house with JSON data");
      console.log("📸 Existing images (ImageUrls):", existingImageUrls.length);
      console.log("📋 Update data:", updateData);

      const res = await boardingHouseAPI.update(editingHouse.id, updateData);
      if (res && res.isSuccess !== false) {
        notification.success(t('ownerBoardingHouses.messages.updateSuccess') + '!');
        setShowModal(false);
        setEditingHouse(null);
        // Reset form
        setHouseData({
          houseName: '',
          description: '',
          addressData: {
            provinceCode: null,
            provinceName: '',
            wardCode: null,
            wardName: '',
            address: ''
          }
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setFormErrors({});
        fetchBoardingHouses();
      }
      else notification.error(t('ownerBoardingHouses.errors.updateFailed') + ': ' + (res?.message || JSON.stringify(res)));
    } catch (e) {
      console.error("❌ Update error:", e);
      console.error("❌ Error response:", e.response?.data);
      console.error("❌ Error status:", e.response?.status);

      let errorMessage = 'Lỗi cập nhật nhà trọ:';

      // Handle 415 Unsupported Media Type
      if (e.response?.status === 415) {
        errorMessage = 'Lỗi định dạng dữ liệu (415): Backend không chấp nhận FormData.\n';
        errorMessage += 'Vui lòng kiểm tra:\n';
        errorMessage += '- Content-Type phải là multipart/form-data\n';
        errorMessage += '- Định dạng dữ liệu gửi lên';
      }
      // Handle 400 Bad Request with validation errors
      else if (e.response?.status === 400) {
        if (e.response?.data?.errors) {
          // ASP.NET validation errors
          errorMessage = 'Lỗi validation (400):\n';
          Object.entries(e.response.data.errors).forEach(([field, msgs]) => {
            const fieldName = field.replace('Location.', 'Địa chỉ.');
            errorMessage += `\n• ${fieldName}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`;
          });
        } else if (e.response?.data?.message) {
          errorMessage = 'Lỗi (400): ' + e.response.data.message;
        } else {
          errorMessage = 'Lỗi (400): ' + JSON.stringify(e.response.data);
        }
      }
      // Handle other errors
      else if (e.response?.data?.message) {
        errorMessage += ' ' + e.response.data.message;
      } else if (e.message) {
        errorMessage += ' ' + e.message;
      } else {
        errorMessage += ' Lỗi không xác định';
      }

      notification.error(errorMessage);
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (houseId) => {
    const confirmed = await notification.confirm(t('ownerBoardingHouses.messages.deleteConfirm'));
    if (!confirmed) return;
    try {
      // Try to delete all rooms first (best effort)
      try {
        const rooms = await roomAPI.getByHouseId(houseId);
        if (Array.isArray(rooms) && rooms.length > 0) {
          for (const r of rooms) { try { await roomAPI.delete(r.id); } catch (e) { console.warn('room delete failed', e); } }
        }
      } catch (e) { console.warn('Could not list/delete rooms before house delete', e); }

      const res = await boardingHouseAPI.delete(houseId);
      if (res && res.isSuccess !== false) {
        notification.success(t('ownerBoardingHouses.messages.deleteSuccess'));
        fetchBoardingHouses();
        return;
      }
      // Check for specific backend error message
      const msg = res?.message || '';
      if (msg.includes('Không thể kiểm tra phòng') || msg.includes('phòng trong nhà trọ')) {
        const goToRooms = await notification.confirm(t('ownerBoardingHouses.messages.deleteRoomsFirst'));
        if (goToRooms) {
          window.location.href = `/owner/rooms?houseId=${houseId}`;
        }
        return;
      }
      notification.error(t('ownerBoardingHouses.errors.deleteFailed') + ': ' + msg);
    } catch (e) {
      console.error('Error deleting boarding house', e);
      const msg = e?.data?.message || e?.message || String(e);
      if (msg.includes('Không thể kiểm tra phòng') || msg.includes('phòng trong nhà trọ')) {
        const goToRooms = await notification.confirm(t('ownerBoardingHouses.messages.deleteRoomsFirst'));
        if (goToRooms) {
          window.location.href = `/owner/rooms?houseId=${houseId}`;
        }
        return;
      }
      notification.error(t('ownerBoardingHouses.errors.deleteFailed') + ': ' + msg);
    }
  };

  const handleEdit = (house) => {
    setEditingHouse(house);
    setHouseData({
      houseName: house.houseName || '',
      description: house.description || '',
      addressData: {
        // Load existing data from backend location if available
        provinceCode: house.location?.provinceCode || house.location?.provinceId || null,
        provinceName: house.location?.provinceName || '',
        wardCode: house.location?.wardCode || house.location?.communeId || null,
        wardName: house.location?.wardName || house.location?.communeName || '',
        address: house.location?.addressDetail || ''
      }
    });

    // Load existing images as preview URLs (not editable in current version)
    if (house.imageUrls && house.imageUrls.length > 0) {
      setImagePreviews(house.imageUrls);
    } else {
      setImagePreviews([]);
    }
    setSelectedImages([]); // Clear file selection

    setFormErrors({});
    setShowModal(true);
  };
  const handleSubmit = () => {
    if (editingHouse) handleUpdate();
    else handleCreate();
  };

  if (!mounted) return null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('ownerBoardingHouses.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ownerBoardingHouses.authRequired')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('ownerBoardingHouses.authRequiredDesc')}</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {t('ownerBoardingHouses.goToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== 'Owner' && user.role !== 2 && user.role !== '2') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ownerBoardingHouses.accessDenied')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('ownerBoardingHouses.accessDeniedDesc')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('ownerBoardingHouses.currentRole')}: {user.role} (Type: {typeof user.role})</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-gray-50 p-6">{t('ownerBoardingHouses.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('ownerBoardingHouses.title')}</h1>
          {error && <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('ownerBoardingHouses.listTitle')}</h2>
          <button onClick={() => { setEditingHouse(null); setHouseData({ houseName: '', description: '', addressData: { provinceCode: null, provinceName: '', wardCode: null, wardName: '', address: '' } }); setFormErrors({}); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">{t('ownerBoardingHouses.addNew')}</button>
        </div>

        {boardingHouses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('ownerBoardingHouses.emptyState.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('ownerBoardingHouses.emptyState.description')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardingHouses.map((house) => (
              <div key={house.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <ImageCarousel images={house.imageUrls} houseName={house.houseName} t={t} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{house.houseName}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{house.description}</p>
                  {house.location && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">
                        {/* Display full address from backend-processed location */}
                        {house.location.fullAddress ||
                          `${house.location.addressDetail}, ${house.location.wardName}, ${house.location.provinceName}` ||
                          `${house.location.addressDetail}, Ward ${house.location.communeId}, Province ${house.location.provinceId}`}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center"><div className="text-lg font-bold text-gray-900 dark:text-white">{house.totalRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">{t('ownerBoardingHouses.card.totalRooms')}</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-green-600">{house.occupiedRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">{t('ownerBoardingHouses.card.occupied')}</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-blue-600">{house.vacantRooms}</div><div className="text-xs text-gray-500 dark:text-gray-400">{t('ownerBoardingHouses.card.vacant')}</div></div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <Link href={`/owner/rooms?houseId=${house.id}&houseName=${encodeURIComponent(house.houseName)}`} className="text-blue-500 hover:underline text-sm font-medium">{t('ownerBoardingHouses.card.manageRooms')}</Link>
                    <Link href={`/owner/boarding-houses/${house.id}/contracts`} className="text-purple-500 hover:underline text-sm font-medium">{t('ownerBoardingHouses.card.manageContracts')}</Link>
                    <button onClick={() => handleEdit(house)} className="text-yellow-500 hover:underline text-sm font-medium">{t('ownerBoardingHouses.card.edit')}</button>
                    <button onClick={() => handleDelete(house.id)} className="text-red-500 hover:underline text-sm font-medium">{t('ownerBoardingHouses.card.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingHouse ? t('ownerBoardingHouses.modal.editTitle') : t('ownerBoardingHouses.modal.createTitle')}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingHouse(null);
                  setHouseData({
                    houseName: '',
                    description: '',
                    addressData: {
                      provinceCode: null,
                      provinceName: '',
                      wardCode: null,
                      wardName: '',
                      address: ''
                    }
                  });
                  setSelectedImages([]);
                  setImagePreviews([]);
                  setFormErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-5">
              {/* House Name Field */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-blue-100 dark:border-gray-700">
                <label htmlFor="houseName" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                  <span className="flex items-center">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-2 text-lg">🏠</span>
                    {t('ownerBoardingHouses.modal.houseName')} <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  id="houseName"
                  value={houseData.houseName}
                  onChange={(e) => {
                    setHouseData({ ...houseData, houseName: e.target.value });
                    if (formErrors.houseName) {
                      setFormErrors({ ...formErrors, houseName: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 font-medium ${formErrors.houseName ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                    }`}
                  placeholder={t('ownerBoardingHouses.modal.houseNamePlaceholder')}
                  maxLength="100"
                />
                {formErrors.houseName && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {formErrors.houseName}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{houseData.houseName.length}</span>/100 ký tự
                </p>
              </div>

              {/* Description Field */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-purple-100 dark:border-gray-700">
                <label htmlFor="description" className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                  <span className="flex items-center">
                    <span className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-2 text-lg">📝</span>
                    {t('ownerBoardingHouses.modal.description')}
                    <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(Tùy chọn)</span>
                  </span>
                </label>
                <textarea
                  id="description"
                  rows="4"
                  value={houseData.description}
                  onChange={(e) => setHouseData({ ...houseData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 font-medium resize-none"
                  placeholder={t('ownerBoardingHouses.modal.descriptionPlaceholder')}
                />
              </div>

              {/* Image Upload Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-green-100 dark:border-gray-700">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">
                  <span className="flex items-center">
                    <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center mr-2 text-lg">📸</span>
                    {t('ownerBoardingHouses.modal.images')}
                    {!editingHouse && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t('ownerBoardingHouses.modal.imagesDesc')}</p>

                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="houseImages"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="houseImages"
                    className={`flex flex-col items-center justify-center w-full py-4 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${formErrors.images
                      ? 'border-red-400 bg-red-50/30 hover:bg-red-50/50 dark:border-red-500 dark:bg-red-900/10'
                      : 'border-blue-300 bg-blue-50/30 hover:bg-blue-50 dark:border-blue-600 dark:bg-blue-900/10 hover:border-blue-500 dark:hover:border-blue-400 dark:hover:bg-blue-900/20'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${formErrors.images
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                      <svg className={`w-5 h-5 ${formErrors.images
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-blue-500 dark:text-blue-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-0.5">{t('ownerBoardingHouses.modal.clickToSelect')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('ownerBoardingHouses.modal.fileTypes')}</p>
                  </label>
                  {formErrors.images && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {formErrors.images}
                    </p>
                  )}
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    {editingHouse && selectedImages.length === 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        📷 Ảnh hiện tại - Bạn có thể xoá ảnh
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                          />
                          {/* Show remove button for both new uploads and existing images in edit mode */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          {selectedImages[index]?.name && (
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                              {selectedImages[index].name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedImages.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">{selectedImages.length}</span> {t('ownerBoardingHouses.modal.imagesSelected')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImages([]);
                        setImagePreviews([]);
                      }}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                    >
                      {t('ownerBoardingHouses.modal.clearAll')}
                    </button>
                  </div>
                )}
              </div>

              {/* Location Section - Using AddressSelector */}
              {/* Frontend collects address data, Backend processes and creates/updates location */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-4 border border-orange-100 dark:border-gray-700">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
                  <span className="flex items-center">
                    <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-2 text-lg">📍</span>
                    {t('ownerBoardingHouses.modal.address')} <span className="text-red-500 ml-1">*</span>
                  </span>
                </label>

                <AddressSelector
                  value={houseData.addressData}
                  onChange={(addressData) => {
                    setHouseData({ ...houseData, addressData });
                    // Clear related errors when address changes
                    const newErrors = { ...formErrors };
                    delete newErrors.province;
                    delete newErrors.ward;
                    delete newErrors.address;
                    setFormErrors(newErrors);
                  }}
                  required={true}
                  errors={formErrors}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 mt-2 border-t-2 border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingHouse(null);
                    setHouseData({
                      houseName: '',
                      description: '',
                      addressData: {
                        provinceCode: null,
                        provinceName: '',
                        wardCode: null,
                        wardName: '',
                        address: ''
                      }
                    });
                    setSelectedImages([]);
                    setImagePreviews([]);
                    setFormErrors({});
                  }}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-bold flex items-center shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t('ownerBoardingHouses.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg transition-all duration-200 font-bold flex items-center justify-center shadow-lg ${submitting
                    ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0'
                    } text-white`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editingHouse ? t('ownerBoardingHouses.modal.saving') : t('ownerBoardingHouses.modal.creating')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingHouse ? t('ownerBoardingHouses.modal.save') : t('ownerBoardingHouses.modal.create')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

